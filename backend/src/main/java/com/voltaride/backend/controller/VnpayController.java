package com.voltaride.backend.controller;

import com.voltaride.backend.service.VnpayService;
import com.voltaride.backend.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class VnpayController {

    private final VnpayService vnpayService;
    private final WalletService walletService;

    public VnpayController(VnpayService vnpayService, WalletService walletService) {
        this.vnpayService = vnpayService;
        this.walletService = walletService;
    }

    @PostMapping("/vnpay/create")
    public ResponseEntity<?> createPayment(
            @Valid @RequestBody CreateVnpayRequest request,
            HttpServletRequest servletRequest
    ) {
        String email = request.email().trim().toLowerCase();
        String txnRef = "VR" + System.currentTimeMillis();

        walletService.createPendingVnpayTransaction(email, request.amount(), txnRef);

        String paymentUrl = vnpayService.createPaymentUrl(
                request.amount(),
                email,
                txnRef,
                servletRequest
        );

        return ResponseEntity.ok(Map.of(
                "paymentUrl", paymentUrl,
                "txnRef", txnRef
        ));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();

        Enumeration<String> parameterNames = request.getParameterNames();

        while (parameterNames.hasMoreElements()) {
            String name = parameterNames.nextElement();
            params.put(name, request.getParameter(name));
        }

        boolean validSignature = vnpayService.verifyReturn(params);

        String responseCode = params.getOrDefault("vnp_ResponseCode", "");
        String transactionStatus = params.getOrDefault("vnp_TransactionStatus", "");
        String txnRef = params.getOrDefault("vnp_TxnRef", "");
        String bankCode = params.getOrDefault("vnp_BankCode", "");

        String status = "failed";
        long amount = 0;

        if (validSignature && "00".equals(responseCode) && "00".equals(transactionStatus)) {
            WalletService.CompletePaymentResult result =
                    walletService.completeVnpayTransaction(txnRef, responseCode, bankCode);

            if (result.success()) {
                status = "success";
                amount = result.amount();
            }
        } else {
            walletService.failVnpayTransaction(txnRef, responseCode, bankCode);
        }

        String redirectUrl = vnpayService.getFrontendReturnUrl()
                + "?vnpayStatus=" + encode(status)
                + "&amount=" + amount
                + "&txnRef=" + encode(txnRef)
                + "&responseCode=" + encode(responseCode);

        return ResponseEntity
                .status(302)
                .header("Location", redirectUrl)
                .build();
    }

    public record CreateVnpayRequest(
            @Min(value = 10000, message = "So tien nap toi thieu la 10000 VND")
            long amount,

            @NotBlank(message = "Email khong duoc de trong")
            @Email(message = "Email khong hop le")
            String email
    ) {
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
package com.voltaride.backend.controller;

import com.voltaride.backend.service.WalletService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyWallet(
            @RequestParam
            @NotBlank(message = "Email khong duoc de trong")
            @Email(message = "Email khong hop le")
            String email
    ) {
        long balance = walletService.getWalletBalance(email);

        return ResponseEntity.ok(Map.of(
                "email", email,
                "walletBalance", balance
        ));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getMyTransactions(
            @RequestParam
            @NotBlank(message = "Email khong duoc de trong")
            @Email(message = "Email khong hop le")
            String email
    ) {
        return ResponseEntity.ok(walletService.getTransactions(email));
    }
}
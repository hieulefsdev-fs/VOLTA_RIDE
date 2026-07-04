package com.voltaride.backend.controller;

import com.voltaride.backend.service.EmailService;
import com.voltaride.backend.service.OtpService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/otp")
public class OtpController {

    private final EmailService emailService;
    private final OtpService otpService;
    private final JdbcTemplate jdbcTemplate;

    public OtpController(
            EmailService emailService,
            OtpService otpService,
            JdbcTemplate jdbcTemplate
    ) {
        this.emailService = emailService;
        this.otpService = otpService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        String email = request.email().trim().toLowerCase();

        String otp = otpService.createOtp(email);

        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(Map.of(
                "message", "Da gui ma OTP ve email"
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String email = request.email().trim().toLowerCase();

        boolean valid = otpService.verifyOtp(email, request.otp());

        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Ma OTP khong dung hoac da het han"
            ));
        }

        jdbcTemplate.update(
                "update users set is_verified = true where email = ?",
                email
        );

        return ResponseEntity.ok(Map.of(
                "message", "Xac minh OTP thanh cong"
        ));
    }

    public record SendOtpRequest(
            @NotBlank(message = "Email khong duoc de trong")
            @Email(message = "Email khong hop le")
            String email
    ) {
    }

    public record VerifyOtpRequest(
            @NotBlank(message = "Email khong duoc de trong")
            @Email(message = "Email khong hop le")
            String email,

            @NotBlank(message = "OTP khong duoc de trong")
            String otp
    ) {
    }
}

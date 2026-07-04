package com.voltaride.backend.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final SecureRandom random = new SecureRandom();

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    public String createOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        String otp = String.format("%06d", random.nextInt(1_000_000));

        OtpData otpData = new OtpData(
                otp,
                LocalDateTime.now().plusMinutes(5)
        );

        otpStorage.put(normalizedEmail, otpData);

        System.out.println("OTP tao ra cho " + normalizedEmail + " la: " + otp);

        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();

        OtpData otpData = otpStorage.get(normalizedEmail);

        if (otpData == null) {
            return false;
        }

        if (otpData.expiredAt().isBefore(LocalDateTime.now())) {
            otpStorage.remove(normalizedEmail);
            return false;
        }

        boolean isValid = otpData.code().equals(otp.trim());

        if (isValid) {
            otpStorage.remove(normalizedEmail);
        }

        return isValid;
    }

    private record OtpData(String code, LocalDateTime expiredAt) {
    }
}

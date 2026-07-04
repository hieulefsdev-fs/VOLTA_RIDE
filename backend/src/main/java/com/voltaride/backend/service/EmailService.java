package com.voltaride.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Ma OTP dang ky tai khoan VOLTA Ride");
        message.setText(
                "Xin chao,\n\n" +
                "Ma OTP dang ky tai khoan VOLTA Ride cua ban la: " + otp + "\n\n" +
                "Ma nay co hieu luc trong 5 phut.\n" +
                "Vui long khong chia se ma nay cho nguoi khac.\n\n" +
                "VOLTA Ride"
        );

        mailSender.send(message);

        System.out.println("Da gui OTP " + otp + " toi email: " + toEmail);
    }
}

package com.voltaride.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
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

    @Async
    public void sendBookingConfirmation(String toEmail, String fullName, String vehicleName,
                                         String startTime, String endTime, String pickupLocation, double totalPrice) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("VOLTA Ride - Xac nhan dat xe #" + vehicleName);
            message.setText(
                "Xin chao " + fullName + ",\n\n" +
                "Ban da dat xe thanh cong tren VOLTA Ride!\n\n" +
                "Chi tiet don thue:\n" +
                "- Xe: " + vehicleName + "\n" +
                "- Thoi gian thue: " + startTime + "\n" +
                "- Thoi gian tra: " + endTime + "\n" +
                "- Tong tien: " + String.format("%,.0f", totalPrice) + " VND\n\n" +
                "Vui long thanh toan de hoan tat dat xe.\n\n" +
                "Cam on ban da su dung VOLTA Ride!\n" +
                "Hotline: 0901-234-567"
            );
            mailSender.send(message);
            System.out.println("Da gui email xac nhan dat xe toi: " + toEmail);
        } catch (Exception e) {
            System.err.println("Loi gui email dat xe: " + e.getMessage());
        }
    }

    @Async
    public void sendPaymentSuccess(String toEmail, String fullName, String vehicleName,
                                    String startTime, String endTime, double totalPrice) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("VOLTA Ride - Thanh toan thanh cong #" + vehicleName);
            message.setText(
                "Xin chao " + fullName + ",\n\n" +
                "Ban da thanh toan thanh cong!\n\n" +
                "Chi tiet:\n" +
                "- Xe: " + vehicleName + "\n" +
                "- Thoi gian thue: " + startTime + "\n" +
                "- Thoi gian tra: " + endTime + "\n" +
                "- So tien: " + String.format("%,.0f", totalPrice) + " VND\n\n" +
                "Vui long den nhan xe dung gio.\n" +
                "Chuc ban co chuyen di vui ve!\n\n" +
                "VOLTA Ride\n" +
                "Hotline: 0901-234-567"
            );
            mailSender.send(message);
            System.out.println("Da gui email thanh toan toi: " + toEmail);
        } catch (Exception e) {
            System.err.println("Loi gui email thanh toan: " + e.getMessage());
        }
    }
}

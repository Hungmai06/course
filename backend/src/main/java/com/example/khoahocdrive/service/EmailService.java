package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.models.Order;
import jakarta.mail.MessagingException;

public interface EmailService {
   void sendEmail(String toEmail, String subject, Order order) throws MessagingException;
   void sendEmailOTP(String toEmail, String otp) throws MessagingException;
}

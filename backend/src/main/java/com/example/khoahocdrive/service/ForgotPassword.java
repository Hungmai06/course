package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.ResetPasswordRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import jakarta.mail.MessagingException;

public interface ForgotPassword {
    void sendNewPassword(String username) throws MessagingException;
    void handleResetPassword(ResetPasswordRequest request);
}

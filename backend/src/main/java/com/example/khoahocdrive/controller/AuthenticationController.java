package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.ForgotPasswordRequest;
import com.example.khoahocdrive.dto.request.RefreshTokenRequest;
import com.example.khoahocdrive.dto.request.ResetPasswordRequest;
import com.example.khoahocdrive.dto.request.SignInRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.TokenResponse;
import com.example.khoahocdrive.service.AuthenticationService;
import com.example.khoahocdrive.service.ForgotPassword;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication Controller")
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final ForgotPassword forgotPassword;
    @PostMapping("/login")
    @Operation(summary = "Access Token")
    public TokenResponse getAccessToken(@RequestBody SignInRequest request) {
        return authenticationService.getAccessToken(request);
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh Token")
    public TokenResponse getRefreshToken(@RequestBody RefreshTokenRequest request){
        return authenticationService.getRefreshToken(request);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Send Otp")
    public void sendOtp(@RequestBody ForgotPasswordRequest request) throws MessagingException {
         forgotPassword.sendNewPassword(request.getUsername());
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password")
    public void resetPassword(@RequestBody ResetPasswordRequest request) {
        forgotPassword.handleResetPassword(request);
    }
}

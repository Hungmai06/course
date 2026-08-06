package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.RefreshTokenRequest;
import com.example.khoahocdrive.dto.request.SignInRequest;
import com.example.khoahocdrive.dto.response.TokenResponse;

public interface AuthenticationService {
    TokenResponse getAccessToken(SignInRequest request);
    TokenResponse getRefreshToken(RefreshTokenRequest request);
}

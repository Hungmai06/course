package com.example.khoahocdrive.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignInRequest {
    private String username;
    private String password;
    private String platform;
    private String deviceToken;
    private String versionApp;
}

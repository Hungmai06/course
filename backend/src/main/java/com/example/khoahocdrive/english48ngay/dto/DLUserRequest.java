package com.example.khoahocdrive.english48ngay.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DLUserRequest {
    private String name;
    private String email;
    private String password;
    private String avatarUrl;
    private Integer points;
    private Integer streak;
    private String role;
}

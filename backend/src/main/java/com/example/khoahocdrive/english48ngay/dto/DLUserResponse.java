package com.example.khoahocdrive.english48ngay.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DLUserResponse {
    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private Integer points;
    private Integer streak;
    private String role;
    private LocalDateTime lastActive;
}

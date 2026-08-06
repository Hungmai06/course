package com.example.khoahocdrive.english48ngay.entity;

import com.example.khoahocdrive.models.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dl_users")
public class DLUser extends AbstractEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "points")
    @Builder.Default
    private Integer points = 0;

    @Column(name = "streak")
    @Builder.Default
    private Integer streak = 0;

    @Column(name = "role")
    @Builder.Default
    private String role = "USER";

    @Column(name = "last_active")
    private java.time.LocalDateTime lastActive;
}

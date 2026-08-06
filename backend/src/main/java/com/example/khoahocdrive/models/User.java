package com.example.khoahocdrive.models;

import com.example.khoahocdrive.supports.enums.VipEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User extends AbstractEntity implements UserDetails, Serializable {

    @Column(name = "email", unique = true)
    @NotNull
    private String email;

    @Column(name = "password")
    @NotNull
    private String password;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "vip")
    @Enumerated(EnumType.STRING)
    private VipEnum vip;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Cart cart;

    @Builder.Default
    @Column(name = "points")
    private Integer points = 30;

    @Builder.Default
    @Column(name = "streak_days")
    private Integer streakDays = 0;

    @Column(name = "last_checkin_date")
    private String lastCheckinDate;

    @Column(name = "referral_code")
    private String referralCode;

    @Builder.Default
    @Column(name = "referrals_count")
    private Integer referralsCount = 0;

    @Builder.Default
    @Column(name = "daily_lessons_count")
    private Integer dailyLessonsCount = 0;

    @Column(name = "last_lesson_date")
    private String lastLessonDate;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = role.getName();
        return List.of(new SimpleGrantedAuthority("ROLE_" + roleName));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}

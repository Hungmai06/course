package com.example.khoahocdrive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreeUserProfileResponse {
    private Long userId;
    private String username;
    private String email;
    private Integer points;
    private Integer streakDays;
    private String lastCheckinDate;
    private String referralCode;
    private Integer referralsCount;
    private Boolean isCheckedInToday;
    private Integer dailyLessonsCount;
    private Integer maxDailyLessons;
}

package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.FreeLearnedHistoryResponse;
import com.example.khoahocdrive.dto.response.FreePointHistoryResponse;
import com.example.khoahocdrive.dto.response.FreeUserProfileResponse;

import java.util.List;

public interface FreeUserService {
    ApiResponse<FreeUserProfileResponse> getUserProfile(String username);
    ApiResponse<FreeUserProfileResponse> performCheckin(String username);
    ApiResponse<FreeUserProfileResponse> completeLesson(String username, Long courseId, String courseTitle, String lessonTitle);
    ApiResponse<FreeUserProfileResponse> unlockFullCourse(String username, Long courseId, String courseTitle);
    ApiResponse<FreeUserProfileResponse> deductLessonPoint(String username, Long courseId, String courseTitle, String lessonTitle);
    ApiResponse<List<FreePointHistoryResponse>> getPointHistory(String username);
    ApiResponse<List<FreeLearnedHistoryResponse>> getLearnedHistory(String username);
    ApiResponse<String> applyReferralCode(String username, String referralCode);

    // Admin APIs
    ApiResponse<List<FreeUserProfileResponse>> getAllUsersGamification();
    ApiResponse<List<FreePointHistoryResponse>> getAllPointHistoriesAdmin();
    ApiResponse<List<FreeLearnedHistoryResponse>> getAllLearnedHistoriesAdmin();
    ApiResponse<FreeUserProfileResponse> adminUpdateUserPoints(Long userId, Integer newPoints, String reason);
}

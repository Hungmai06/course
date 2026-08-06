package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.FreeLearnedHistoryResponse;
import com.example.khoahocdrive.dto.response.FreePointHistoryResponse;
import com.example.khoahocdrive.dto.response.FreeUserProfileResponse;
import com.example.khoahocdrive.service.FreeUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/free-user")
@RequiredArgsConstructor
@Tag(name = "FREE USER HUB & GAMIFICATION API")
public class FreeUserController {

    private final FreeUserService freeUserService;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Chưa đăng nhập tài khoản");
        }
        return authentication.getName();
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy thông tin Gamification & Điểm thưởng của User hiện tại")
    public ApiResponse<FreeUserProfileResponse> getProfile() {
        return freeUserService.getUserProfile(getCurrentUsername());
    }

    @PostMapping("/checkin")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Điểm danh hàng ngày qua Shopee")
    public ApiResponse<FreeUserProfileResponse> performCheckin() {
        return freeUserService.performCheckin(getCurrentUsername());
    }

    @PostMapping("/complete-lesson")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Học 1 bài học (+1 điểm thưởng)")
    public ApiResponse<FreeUserProfileResponse> completeLesson(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String courseTitle,
            @RequestParam(required = false) String lessonTitle) {
        return freeUserService.completeLesson(getCurrentUsername(), courseId, courseTitle, lessonTitle);
    }

    @PostMapping("/unlock-course")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mở trọn bộ khóa học (Trừ 20 điểm)")
    public ApiResponse<FreeUserProfileResponse> unlockFullCourse(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String courseTitle) {
        return freeUserService.unlockFullCourse(getCurrentUsername(), courseId, courseTitle);
    }

    @PostMapping("/deduct-point")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Học 1 bài học (+1 điểm thưởng - legacy alias)")
    public ApiResponse<FreeUserProfileResponse> deductLessonPoint(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String courseTitle,
            @RequestParam(required = false) String lessonTitle) {
        return freeUserService.completeLesson(getCurrentUsername(), courseId, courseTitle, lessonTitle);
    }

    @GetMapping("/point-history")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy nhật ký cộng trừ điểm của User")
    public ApiResponse<List<FreePointHistoryResponse>> getPointHistory() {
        return freeUserService.getPointHistory(getCurrentUsername());
    }

    @GetMapping("/learned-history")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy danh sách các bài học/khóa học đã xem")
    public ApiResponse<List<FreeLearnedHistoryResponse>> getLearnedHistory() {
        return freeUserService.getLearnedHistory(getCurrentUsername());
    }

    @PostMapping("/referral")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Áp dụng mã giới thiệu bạn bè (+5 điểm cho người giới thiệu)")
    public ApiResponse<String> applyReferral(@RequestParam String code) {
        return freeUserService.applyReferralCode(getCurrentUsername(), code);
    }

    // ==========================================
    // ADMIN ENDPOINTS FOR FREE USER GAMIFICATION
    // ==========================================

    @GetMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Admin: Lấy danh sách tất cả học viên kèm thông tin Gamification & Điểm thưởng")
    public ApiResponse<List<FreeUserProfileResponse>> getAllUsersGamificationAdmin() {
        return freeUserService.getAllUsersGamification();
    }

    @GetMapping("/admin/point-history")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Admin: Lấy toàn bộ nhật ký tích/trừ điểm của tất cả học viên")
    public ApiResponse<List<FreePointHistoryResponse>> getAllPointHistoriesAdmin() {
        return freeUserService.getAllPointHistoriesAdmin();
    }

    @GetMapping("/admin/learned-history")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Admin: Lấy toàn bộ nhật ký bài học đã xem của tất cả học viên")
    public ApiResponse<List<FreeLearnedHistoryResponse>> getAllLearnedHistoriesAdmin() {
        return freeUserService.getAllLearnedHistoriesAdmin();
    }

    @PostMapping("/admin/update-points")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Admin: Điều chỉnh/cập nhật điểm thưởng cho Học viên")
    public ApiResponse<FreeUserProfileResponse> adminUpdateUserPoints(
            @RequestParam Long userId,
            @RequestParam Integer newPoints,
            @RequestParam(required = false) String reason) {
        return freeUserService.adminUpdateUserPoints(userId, newPoints, reason);
    }
}

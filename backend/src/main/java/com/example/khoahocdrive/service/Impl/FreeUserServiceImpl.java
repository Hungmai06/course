package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.FreeLearnedHistoryResponse;
import com.example.khoahocdrive.dto.response.FreePointHistoryResponse;
import com.example.khoahocdrive.dto.response.FreeUserProfileResponse;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.models.FreeLearnedHistory;
import com.example.khoahocdrive.models.FreePointHistory;
import com.example.khoahocdrive.models.User;
import com.example.khoahocdrive.repository.FreeLearnedHistoryRepository;
import com.example.khoahocdrive.repository.FreePointHistoryRepository;
import com.example.khoahocdrive.repository.UserRepository;
import com.example.khoahocdrive.service.FreeUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FreeUserServiceImpl implements FreeUserService {

    private final UserRepository userRepository;
    private final FreePointHistoryRepository pointHistoryRepository;
    private final FreeLearnedHistoryRepository learnedHistoryRepository;

    private String generateReferralCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder("FREE-");
        Random random = new Random();
        for (int i = 0; i < 5; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private User getOrCreateUserGamification(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        boolean needSave = false;
        if (user.getPoints() == null) {
            user.setPoints(30);
            needSave = true;

            // Log initial registration bonus
            pointHistoryRepository.save(FreePointHistory.builder()
                    .user(user)
                    .action("Thưởng Đăng Ký Tài Khoản Mới")
                    .pointsChange("+30")
                    .build());
        }
        if (user.getStreakDays() == null) {
            user.setStreakDays(0);
            needSave = true;
        }
        if (user.getReferralsCount() == null) {
            user.setReferralsCount(0);
            needSave = true;
        }
        String todayStr = LocalDate.now().toString();
        if (user.getDailyLessonsCount() == null || !todayStr.equals(user.getLastLessonDate())) {
            user.setDailyLessonsCount(0);
            user.setLastLessonDate(todayStr);
            needSave = true;
        }

        if (needSave) {
            user = userRepository.save(user);
        }
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<FreeUserProfileResponse> getUserProfile(String username) {
        User user = getOrCreateUserGamification(username);
        String todayStr = LocalDate.now().toString();
        boolean isCheckedIn = todayStr.equals(user.getLastCheckinDate());
        int dailyCount = (todayStr.equals(user.getLastLessonDate()) && user.getDailyLessonsCount() != null)
                ? user.getDailyLessonsCount()
                : 0;

        FreeUserProfileResponse response = FreeUserProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .points(user.getPoints())
                .streakDays(user.getStreakDays())
                .lastCheckinDate(user.getLastCheckinDate())
                .referralCode(user.getReferralCode())
                .referralsCount(user.getReferralsCount())
                .isCheckedInToday(isCheckedIn)
                .dailyLessonsCount(dailyCount)
                .maxDailyLessons(5)
                .build();

        return ApiResponse.<FreeUserProfileResponse>builder()
                .data(response)
                .message("Get free user profile successful")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<FreeUserProfileResponse> performCheckin(String username) {
        User user = getOrCreateUserGamification(username);
        String todayStr = LocalDate.now().toString();

        if (todayStr.equals(user.getLastCheckinDate())) {
            return ApiResponse.<FreeUserProfileResponse>builder()
                    .code(400)
                    .message("Bạn đã điểm danh hôm nay rồi!")
                    .data(getUserProfile(username).getData())
                    .build();
        }

        int currentStreak = user.getStreakDays() != null ? user.getStreakDays() : 0;
        int newStreak = currentStreak + 1;

        if (user.getLastCheckinDate() != null && !user.getLastCheckinDate().isEmpty()) {
            try {
                LocalDate lastDate = LocalDate.parse(user.getLastCheckinDate());
                if (LocalDate.now().minusDays(1).isAfter(lastDate)) {
                    newStreak = 1; // Missed a day -> reset streak
                }
            } catch (Exception e) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }

        int earnedPts = 1;
        if (newStreak >= 7) {
            earnedPts = 5;
        } else if (newStreak >= 2) {
            earnedPts = 2;
        }

        user.setPoints(user.getPoints() + earnedPts);
        user.setStreakDays(newStreak);
        user.setLastCheckinDate(todayStr);
        userRepository.save(user);

        // Record history
        pointHistoryRepository.save(FreePointHistory.builder()
                .user(user)
                .action("Điểm Danh Shopee (Ngày " + newStreak + ")")
                .pointsChange("+" + earnedPts)
                .build());

        FreeUserProfileResponse response = FreeUserProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .points(user.getPoints())
                .streakDays(user.getStreakDays())
                .lastCheckinDate(user.getLastCheckinDate())
                .referralCode(user.getReferralCode())
                .referralsCount(user.getReferralsCount())
                .isCheckedInToday(true)
                .build();

        return ApiResponse.<FreeUserProfileResponse>builder()
                .data(response)
                .message("Điểm danh thành công! +" + earnedPts + " điểm")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<FreeUserProfileResponse> completeLesson(String username, Long courseId, String courseTitle, String lessonTitle) {
        User user = getOrCreateUserGamification(username);

        String todayStr = LocalDate.now().toString();
        int currentCount = (todayStr.equals(user.getLastLessonDate()) && user.getDailyLessonsCount() != null)
                ? user.getDailyLessonsCount()
                : 0;

        String titleToLog = lessonTitle != null && !lessonTitle.isEmpty() ? lessonTitle : (courseTitle != null ? courseTitle : "Bài học Free");
        if (titleToLog.length() > 35) {
            titleToLog = titleToLog.substring(0, 35) + "...";
        }

        if (currentCount < 5) {
            // First 5 lessons of the day: FREE & Award +1 Point
            user.setDailyLessonsCount(currentCount + 1);
            user.setLastLessonDate(todayStr);
            user.setPoints(user.getPoints() + 1);
            userRepository.save(user);

            pointHistoryRepository.save(FreePointHistory.builder()
                    .user(user)
                    .action("Học 1 Bài Học (+1đ) (" + titleToLog + ")")
                    .pointsChange("+1")
                    .build());

            learnedHistoryRepository.save(FreeLearnedHistory.builder()
                    .user(user)
                    .courseId(courseId)
                    .courseTitle(courseTitle)
                    .lessonTitle(lessonTitle)
                    .build());

            return ApiResponse.<FreeUserProfileResponse>builder()
                    .data(getUserProfile(username).getData())
                    .message("Học bài học thành công! Bạn nhận được +1 điểm thưởng 🎉 (Bài " + (currentCount + 1) + "/5 miễn phí)")
                    .build();
        } else {
            // Lessons beyond 5 per day: Require & Deduct 1 Point (-1pt)
            if (user.getPoints() < 1) {
                return ApiResponse.<FreeUserProfileResponse>builder()
                        .code(400)
                        .message("Bạn đã học hết 5 bài miễn phí hôm nay. Để học tiếp bài này cần 1 điểm thưởng (Số dư: " + user.getPoints() + "đ). Hãy điểm danh Shopee hoặc mời bạn bè để tích thêm điểm nhé!")
                        .data(getUserProfile(username).getData())
                        .build();
            }

            user.setDailyLessonsCount(currentCount + 1);
            user.setLastLessonDate(todayStr);
            user.setPoints(user.getPoints() - 1);
            userRepository.save(user);

            pointHistoryRepository.save(FreePointHistory.builder()
                    .user(user)
                    .action("Mở Bài Học Tiếp Theo (-1đ) (" + titleToLog + ")")
                    .pointsChange("-1")
                    .build());

            learnedHistoryRepository.save(FreeLearnedHistory.builder()
                    .user(user)
                    .courseId(courseId)
                    .courseTitle(courseTitle)
                    .lessonTitle(lessonTitle)
                    .build());

            return ApiResponse.<FreeUserProfileResponse>builder()
                    .data(getUserProfile(username).getData())
                    .message("Mở bài học tiếp theo thành công! Đã trừ 1 điểm thưởng ✨")
                    .build();
        }
    }

    @Override
    @Transactional
    public ApiResponse<FreeUserProfileResponse> unlockFullCourse(String username, Long courseId, String courseTitle) {
        User user = getOrCreateUserGamification(username);

        if (user.getPoints() < 20) {
            return ApiResponse.<FreeUserProfileResponse>builder()
                    .code(400)
                    .message("Số dư điểm không đủ để mở trọn bộ khóa học (Cần 20 điểm). Hãy học bài lẻ (+1đ/bài) hoặc điểm danh Shopee để tích đủ điểm nhé!")
                    .data(getUserProfile(username).getData())
                    .build();
        }

        // Deduct 20 Points to unlock full course
        user.setPoints(user.getPoints() - 20);
        userRepository.save(user);

        String titleToLog = courseTitle != null ? courseTitle : "Khóa học Free";
        if (titleToLog.length() > 35) {
            titleToLog = titleToLog.substring(0, 35) + "...";
        }

        // Record Point History Log (-20 points)
        pointHistoryRepository.save(FreePointHistory.builder()
                .user(user)
                .action("Mở Trọn Bộ Khóa Học (-20đ) (" + titleToLog + ")")
                .pointsChange("-20")
                .build());

        // Record Learned History Log
        learnedHistoryRepository.save(FreeLearnedHistory.builder()
                .user(user)
                .courseId(courseId)
                .courseTitle(courseTitle)
                .lessonTitle("Trọn bộ khóa học (" + titleToLog + ")")
                .build());

        return ApiResponse.<FreeUserProfileResponse>builder()
                .data(getUserProfile(username).getData())
                .message("Mở trọn bộ khóa học thành công! Đã trừ 20 điểm ✨")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<FreeUserProfileResponse> deductLessonPoint(String username, Long courseId, String courseTitle, String lessonTitle) {
        return completeLesson(username, courseId, courseTitle, lessonTitle);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<FreePointHistoryResponse>> getPointHistory(String username) {
        User user = getOrCreateUserGamification(username);
        List<FreePointHistory> list = pointHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

        List<FreePointHistoryResponse> result = list.stream().map(h -> {
            Date created = h.getCreatedAt() != null ? h.getCreatedAt() : new Date();
            return FreePointHistoryResponse.builder()
                    .id(h.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .action(h.getAction())
                    .points(h.getPointsChange())
                    .date(dateFormat.format(created))
                    .time(timeFormat.format(created))
                    .build();
        }).toList();

        return ApiResponse.<List<FreePointHistoryResponse>>builder()
                .data(result)
                .message("Get point history successful")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<FreeLearnedHistoryResponse>> getLearnedHistory(String username) {
        User user = getOrCreateUserGamification(username);
        List<FreeLearnedHistory> list = learnedHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

        List<FreeLearnedHistoryResponse> result = list.stream().map(h -> {
            Date created = h.getCreatedAt() != null ? h.getCreatedAt() : new Date();
            return FreeLearnedHistoryResponse.builder()
                    .id(h.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .courseId(h.getCourseId())
                    .courseTitle(h.getCourseTitle())
                    .lessonTitle(h.getLessonTitle())
                    .date(dateFormat.format(created))
                    .time(timeFormat.format(created))
                    .build();
        }).toList();

        return ApiResponse.<List<FreeLearnedHistoryResponse>>builder()
                .data(result)
                .message("Get learned history successful")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<String> applyReferralCode(String username, String referralCode) {
        User currentUser = getOrCreateUserGamification(username);

        if (referralCode == null || referralCode.trim().isEmpty()) {
            return ApiResponse.<String>builder().code(400).message("Mã giới thiệu không hợp lệ").build();
        }

        Optional<User> referrerOpt = userRepository.findByReferralCode(referralCode.trim());
        if (referrerOpt.isEmpty()) {
            return ApiResponse.<String>builder().code(404).message("Mã giới thiệu không tồn tại").build();
        }

        User referrer = referrerOpt.get();
        if (referrer.getId().equals(currentUser.getId())) {
            return ApiResponse.<String>builder().code(400).message("Bạn không thể tự giới thiệu chính mình").build();
        }

        // Award 5 points to referrer
        referrer.setPoints((referrer.getPoints() != null ? referrer.getPoints() : 0) + 5);
        referrer.setReferralsCount((referrer.getReferralsCount() != null ? referrer.getReferralsCount() : 0) + 1);
        userRepository.save(referrer);

        pointHistoryRepository.save(FreePointHistory.builder()
                .user(referrer)
                .action("Thưởng Giới Thiệu Bạn Bè (" + currentUser.getUsername() + ")")
                .pointsChange("+5")
                .build());

        return ApiResponse.<String>builder()
                .data("Thành công")
                .message("Áp dụng mã giới thiệu thành công (+5 điểm cho người giới thiệu)")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<FreeUserProfileResponse>> getAllUsersGamification() {
        List<User> allUsers = userRepository.findAll();
        String todayStr = LocalDate.now().toString();

        List<FreeUserProfileResponse> list = allUsers.stream().map(user -> {
            boolean isCheckedIn = todayStr.equals(user.getLastCheckinDate());
            int dailyCount = (todayStr.equals(user.getLastLessonDate()) && user.getDailyLessonsCount() != null)
                    ? user.getDailyLessonsCount()
                    : 0;

            return FreeUserProfileResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .points(user.getPoints() != null ? user.getPoints() : 0)
                    .streakDays(user.getStreakDays() != null ? user.getStreakDays() : 0)
                    .lastCheckinDate(user.getLastCheckinDate())
                    .referralCode(user.getReferralCode())
                    .referralsCount(user.getReferralsCount() != null ? user.getReferralsCount() : 0)
                    .isCheckedInToday(isCheckedIn)
                    .dailyLessonsCount(dailyCount)
                    .maxDailyLessons(5)
                    .build();
        }).toList();

        return ApiResponse.<List<FreeUserProfileResponse>>builder()
                .data(list)
                .message("Get all users gamification profile successful")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<FreePointHistoryResponse>> getAllPointHistoriesAdmin() {
        List<FreePointHistory> list = pointHistoryRepository.findAllByOrderByCreatedAtDesc();

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

        List<FreePointHistoryResponse> result = list.stream().map(h -> {
            Date created = h.getCreatedAt() != null ? h.getCreatedAt() : new Date();
            String uName = h.getUser() != null ? h.getUser().getUsername() : "N/A";
            String uEmail = h.getUser() != null ? h.getUser().getEmail() : "N/A";
            return FreePointHistoryResponse.builder()
                    .id(h.getId())
                    .username(uName)
                    .email(uEmail)
                    .action(h.getAction())
                    .points(h.getPointsChange())
                    .date(dateFormat.format(created))
                    .time(timeFormat.format(created))
                    .build();
        }).toList();

        return ApiResponse.<List<FreePointHistoryResponse>>builder()
                .data(result)
                .message("Get all point history for admin successful")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<FreeLearnedHistoryResponse>> getAllLearnedHistoriesAdmin() {
        List<FreeLearnedHistory> list = learnedHistoryRepository.findAllByOrderByCreatedAtDesc();

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

        List<FreeLearnedHistoryResponse> result = list.stream().map(h -> {
            Date created = h.getCreatedAt() != null ? h.getCreatedAt() : new Date();
            String uName = h.getUser() != null ? h.getUser().getUsername() : "N/A";
            String uEmail = h.getUser() != null ? h.getUser().getEmail() : "N/A";
            return FreeLearnedHistoryResponse.builder()
                    .id(h.getId())
                    .username(uName)
                    .email(uEmail)
                    .courseId(h.getCourseId())
                    .courseTitle(h.getCourseTitle())
                    .lessonTitle(h.getLessonTitle())
                    .date(dateFormat.format(created))
                    .time(timeFormat.format(created))
                    .build();
        }).toList();

        return ApiResponse.<List<FreeLearnedHistoryResponse>>builder()
                .data(result)
                .message("Get all learned history for admin successful")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<FreeUserProfileResponse> adminUpdateUserPoints(Long userId, Integer newPoints, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        int oldPts = user.getPoints() != null ? user.getPoints() : 0;
        int diff = newPoints - oldPts;
        String changeStr = diff >= 0 ? ("+" + diff) : String.valueOf(diff);

        user.setPoints(newPoints);
        userRepository.save(user);

        String note = reason != null && !reason.trim().isEmpty() ? reason.trim() : "Admin điều chỉnh điểm";
        pointHistoryRepository.save(FreePointHistory.builder()
                .user(user)
                .action("Admin " + note + " (" + changeStr + "đ)")
                .pointsChange(changeStr)
                .build());

        return ApiResponse.<FreeUserProfileResponse>builder()
                .data(getUserProfile(user.getUsername()).getData())
                .message("Cập nhật điểm người dùng thành công! Điểm mới: " + newPoints)
                .build();
    }
}

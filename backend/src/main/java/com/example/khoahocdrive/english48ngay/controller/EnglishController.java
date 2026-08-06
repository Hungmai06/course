package com.example.khoahocdrive.english48ngay.controller;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.english48ngay.dto.ProgressUpdateRequest;
import com.example.khoahocdrive.english48ngay.entity.CourseDay;
import com.example.khoahocdrive.english48ngay.entity.CourseStudent;
import com.example.khoahocdrive.english48ngay.entity.StudentProgress;
import com.example.khoahocdrive.english48ngay.service.EnglishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/english")
@Tag(name = "English 48 Ngay API")
public class EnglishController {

    private final EnglishService englishService;

    @GetMapping("/check-english-48-ngay")
    @Operation(summary = "Check if user/email has access to 48ngay course")
    public boolean checkEnglish48Ngay(@RequestParam String email, @RequestParam String keyword) {
        return englishService.checkUserHasEnglish48Ngay(email, keyword);
    }

    // ==========================================
    // Course Student Endpoints (Admin)
    // ==========================================
    @GetMapping("/students")
    @Operation(summary = "Get course students (optional pagination and search)")
    public ApiResponse<Object> getAllStudents(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search) {
        if (page != null && size != null) {
            return ApiResponse.<Object>builder()
                    .code(200)
                    .message("Fetched students page successfully")
                    .data(englishService.getAllStudents(page, size, search))
                    .build();
        }
        List<CourseStudent> students = englishService.getAllStudents();
        return ApiResponse.<Object>builder()
                .code(200)
                .message("Fetched all 48ngay students successfully")
                .data(students)
                .build();
    }

    @GetMapping("/students/{id}")
    @Operation(summary = "Get a 48ngay course student by ID")
    public ApiResponse<CourseStudent> getStudentById(@PathVariable Long id) {
        CourseStudent student = englishService.getStudentById(id);
        return ApiResponse.<CourseStudent>builder()
                .code(200)
                .message("Fetched student successfully")
                .data(student)
                .build();
    }

    @PostMapping("/students")
    @Operation(summary = "Add a new 48ngay course student")
    public ApiResponse<CourseStudent> createStudent(@RequestBody CourseStudent student) {
        CourseStudent created = englishService.createStudent(student);
        return ApiResponse.<CourseStudent>builder()
                .code(201)
                .message("Student created successfully")
                .data(created)
                .build();
    }

    @PutMapping("/students/{id}")
    @Operation(summary = "Update an existing 48ngay course student")
    public ApiResponse<CourseStudent> updateStudent(@PathVariable Long id, @RequestBody CourseStudent studentDetails) {
        CourseStudent updated = englishService.updateStudent(id, studentDetails);
        return ApiResponse.<CourseStudent>builder()
                .code(200)
                .message("Student updated successfully")
                .data(updated)
                .build();
    }

    @DeleteMapping("/students/{id}")
    @Operation(summary = "Delete a 48ngay course student")
    public ApiResponse<Void> deleteStudent(@PathVariable Long id) {
        englishService.deleteStudent(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Student deleted successfully")
                .build();
    }

    // ==========================================
    // Course Day (Lesson) Endpoints
    // ==========================================
    @GetMapping("/lessons")
    @Operation(summary = "Get all 48ngay course days/lessons")
    public ApiResponse<List<CourseDay>> getAllLessons() {
        List<CourseDay> lessons = englishService.getAllLessons();
        return ApiResponse.<List<CourseDay>>builder()
                .code(200)
                .message("Fetched all lessons successfully")
                .data(lessons)
                .build();
    }

    @GetMapping("/lessons/{day}")
    @Operation(summary = "Get a 48ngay lesson by day number")
    public ApiResponse<CourseDay> getLessonByDay(@PathVariable Integer day) {
        CourseDay lesson = englishService.getLessonByDay(day);
        return ApiResponse.<CourseDay>builder()
                .code(200)
                .message("Fetched lesson details successfully")
                .data(lesson)
                .build();
    }

    @PostMapping("/lessons")
    @Operation(summary = "Create a new 48ngay course day/lesson (Admin)")
    public ApiResponse<CourseDay> createLesson(@RequestBody CourseDay lesson) {
        CourseDay created = englishService.createLesson(lesson);
        return ApiResponse.<CourseDay>builder()
                .code(201)
                .message("Lesson created successfully")
                .data(created)
                .build();
    }

    @PutMapping("/lessons/{day}")
    @Operation(summary = "Update an existing 48ngay course day/lesson (Admin)")
    public ApiResponse<CourseDay> updateLesson(@PathVariable Integer day, @RequestBody CourseDay lessonDetails) {
        CourseDay updated = englishService.updateLesson(day, lessonDetails);
        return ApiResponse.<CourseDay>builder()
                .code(200)
                .message("Lesson updated successfully")
                .data(updated)
                .build();
    }

    @DeleteMapping("/lessons/{day}")
    @Operation(summary = "Delete a 48ngay course day/lesson (Admin)")
    public ApiResponse<Void> deleteLesson(@PathVariable Integer day) {
        englishService.deleteLesson(day);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Lesson deleted successfully")
                .build();
    }

    // ==========================================
    // Student Progress Endpoints
    // ==========================================
    @GetMapping("/progress")
    @Operation(summary = "Get course progress for a student")
    public ApiResponse<List<StudentProgress>> getStudentProgress(@RequestParam String username) {
        List<StudentProgress> progress = englishService.getStudentProgress(username);
        return ApiResponse.<List<StudentProgress>>builder()
                .code(200)
                .message("Fetched student progress successfully")
                .data(progress)
                .build();
    }

    @PostMapping("/progress")
    @Operation(summary = "Update course progress for a student")
    public ApiResponse<StudentProgress> updateStudentProgress(@RequestBody ProgressUpdateRequest request) {
        StudentProgress progress = englishService.updateStudentProgress(
                request.getUsername(),
                request.getDay(),
                request.getStatus(),
                request.getVocabLearned()
        );
        return ApiResponse.<StudentProgress>builder()
                .code(200)
                .message("Student progress updated successfully")
                .data(progress)
                .build();
    }
}

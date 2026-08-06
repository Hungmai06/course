package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.CourseFreeRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CourseFreeResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.service.CourseFreeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-free")
@RequiredArgsConstructor
@Tag(name = "COURSE FREE API")
public class CourseFreeController {

    private final CourseFreeService courseFreeService;

    @GetMapping("/")
    @Operation(summary = "Get all free courses (paged, searchable & category filterable)")
    public ApiResponse<PagedResponse<CourseFreeResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category) {
        return courseFreeService.getAllFreeCoursesPaged(page, size, description, category);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all free courses as list")
    public ApiResponse<List<CourseFreeResponse>> getAllList() {
        return courseFreeService.getAllFreeCourses();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get free course by ID")
    public ApiResponse<CourseFreeResponse> getById(@PathVariable Long id) {
        return courseFreeService.getFreeCourseById(id);
    }

    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Create free course (multipart)")
    public ApiResponse<CourseFreeResponse> create(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("data") CourseFreeRequest data) throws Exception {
        return courseFreeService.createFreeCourse(file, data);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update free course (multipart)")
    public ApiResponse<CourseFreeResponse> update(
            @PathVariable Long id,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("data") CourseFreeRequest request) throws Exception {
        return courseFreeService.updateFreeCourse(id, file, request);
    }

    @PostMapping("/{id}/view")
    @Operation(summary = "Increment view count for free course")
    public ApiResponse<CourseFreeResponse> incrementView(@PathVariable Long id) {
        return courseFreeService.incrementViewCount(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Delete free course")
    public void delete(@PathVariable Long id) {
        courseFreeService.deleteFreeCourse(id);
    }
}

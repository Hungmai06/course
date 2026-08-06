package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.CourseFreeRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CourseFreeResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CourseFreeService {
    ApiResponse<List<CourseFreeResponse>> getAllFreeCourses();

    ApiResponse<PagedResponse<CourseFreeResponse>> getAllFreeCoursesPaged(int page, int size, String description, String category);

    ApiResponse<CourseFreeResponse> getFreeCourseById(Long id);

    ApiResponse<CourseFreeResponse> createFreeCourse(MultipartFile file, CourseFreeRequest request) throws Exception;

    ApiResponse<CourseFreeResponse> updateFreeCourse(Long id, MultipartFile file, CourseFreeRequest request) throws Exception;

    ApiResponse<CourseFreeResponse> incrementViewCount(Long id);

    void deleteFreeCourse(Long id);
}

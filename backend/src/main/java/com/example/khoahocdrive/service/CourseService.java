package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.CourseRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CourseResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface CourseService {
    ApiResponse<CourseResponse> findCourseById(Long id);
    ApiResponse<CourseResponse> create(MultipartFile file, CourseRequest request) throws Exception;
    ApiResponse<CourseResponse> update(Long id,MultipartFile file, CourseRequest request) throws Exception;
    ApiResponse<PagedResponse<CourseResponse>> getAll(int page, int size);
    ApiResponse<PagedResponse<CourseResponse>> getAllByCategoryId(int page, int size, String name);
    void delete(Long id);
    ApiResponse<List<CourseResponse>> getMyCourse(Long userId);
    ApiResponse<CourseResponse> findCourseBySlug(String slug);
    ApiResponse<String> syncSlugs();
    ApiResponse<CourseResponse> getFullCourse();
    ApiResponse<CourseResponse> updateFullCourse(MultipartFile file, CourseRequest request) throws Exception;
}

package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CourseResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.dto.response.UserResponse;
import com.example.khoahocdrive.models.Course;

import java.util.List;

public interface SearchCourse {
    ApiResponse<PagedResponse<CourseResponse>>searchCourses(String keyword, int page, int size);
}

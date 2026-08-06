package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.CategoryRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    ApiResponse<CategoryResponse> findCategoryById(Long id);
    ApiResponse<List<CategoryResponse>> getAll();
    ApiResponse<CategoryResponse> create(CategoryRequest request);
    ApiResponse<CategoryResponse> update(Long id, CategoryRequest request);
    void delete(Long id);
}

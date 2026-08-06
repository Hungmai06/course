package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.CategoryRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CategoryResponse;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.mapper.CategoryMapper;
import com.example.khoahocdrive.models.Category;
import com.example.khoahocdrive.repository.CategoryRepository;
import com.example.khoahocdrive.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    @Override
    public ApiResponse<CategoryResponse> findCategoryById(Long id) {
        Category category =categoryRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Category not found")
        );

        return ApiResponse.<CategoryResponse>builder()
                .data(categoryMapper.toResponse(category))
                .message("Find Category By Id")
                .build();
    }

    @Override
    public ApiResponse<List<CategoryResponse>> getAll() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryResponse> categoryResponses = categories.stream().map(categoryMapper::toResponse).toList();
        return ApiResponse.<List<CategoryResponse>>builder()
                .message("Get all Category")
                .data(categoryResponses)
                .build();
    }

    @Override
    public ApiResponse<CategoryResponse> create(CategoryRequest request) {
        if(categoryRepository.findCategoryByName(request.getName()).isPresent()){
            throw new InvalidDataException("Category existed");
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        categoryRepository.save(category);
        return ApiResponse.<CategoryResponse>builder()
                .data(categoryMapper.toResponse(category))
                .message("Create Category")
                .build();
    }

    @Override
    public ApiResponse<CategoryResponse> update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Category not found")
        );
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        categoryRepository.save(category);
        return ApiResponse.<CategoryResponse>builder()
                .message("Update Category")
                .data(categoryMapper.toResponse(category))
                .build();
    }

    @Override
    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }
}

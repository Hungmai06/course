package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.CategoryRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CategoryResponse;
import com.example.khoahocdrive.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/category")
@RequiredArgsConstructor
@Tag(name = "Category API")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("/{id}")
    @Operation(summary = "Find Category By Id")
    public ApiResponse<CategoryResponse> findCategoryById(@PathVariable Long id){
        return categoryService.findCategoryById(id);
    }

    @GetMapping("/")
    @Operation(summary = "Get all category")
    public ApiResponse<List<CategoryResponse>> getAll(){
        return categoryService.getAll();
    }

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Create Category")
    public ApiResponse<CategoryResponse> create(@RequestBody CategoryRequest request){
        return categoryService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update Category")
    public ApiResponse<CategoryResponse> update(@PathVariable Long id, @RequestBody CategoryRequest request){
        return categoryService.update(id,request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Delete Category")
    public void delete(@PathVariable Long id){
        categoryService.delete(id);
    }
}

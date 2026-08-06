package com.example.khoahocdrive.mapper;

import com.example.khoahocdrive.dto.response.CategoryResponse;
import com.example.khoahocdrive.models.Category;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
}

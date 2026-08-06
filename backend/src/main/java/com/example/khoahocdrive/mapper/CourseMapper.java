package com.example.khoahocdrive.mapper;

import com.example.khoahocdrive.dto.response.CourseResponse;
import com.example.khoahocdrive.models.Course;
import com.example.khoahocdrive.supports.utils.CloudinaryUtils;
import org.mapstruct.AfterMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface CourseMapper {

    @Mapping(source = "category.name", target = "nameCategory")
    @Mapping(source = "author.name", target = "nameAuthor")
    CourseResponse toResponse(Course course);

    /**
     * Automatically optimize any Cloudinary image URL after MapStruct mapping.
     * Injects {@code f_auto,q_auto} into the URL so browsers receive the best
     * format (WebP/AVIF) without changing the database.
     */
    @AfterMapping
    default void optimizeCloudinaryUrls(@MappingTarget CourseResponse response) {
        response.setAvatar(CloudinaryUtils.optimize(response.getAvatar()));
    }
}

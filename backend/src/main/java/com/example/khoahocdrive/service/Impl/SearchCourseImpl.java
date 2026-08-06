package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CourseResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.mapper.CourseMapper;
import com.example.khoahocdrive.models.Course;
import com.example.khoahocdrive.repository.CourseRepository;
import com.example.khoahocdrive.service.SearchCourse;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchCourseImpl implements SearchCourse {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    @Override
    public ApiResponse<PagedResponse<CourseResponse>> searchCourses(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // ✅ Query + paginate trực tiếp DB, và repository đã @EntityGraph => không N+1 khi mapper đọc author/category
        Page<Course> courses = courseRepository.findAll(containsKeyword(keyword), pageable);

        List<CourseResponse> courseResponses = courses.getContent()
                .stream()
                .map(courseMapper::toResponse)
                .toList();

        PagedResponse<CourseResponse> paged = PagedResponse.<CourseResponse>builder()
                .content(courseResponses)
                .pageNumber(courses.getNumber())
                .pageSize(courses.getSize())
                .totalElements(courses.getTotalElements())
                .totalPages(courses.getTotalPages())
                .build();

        return ApiResponse.<PagedResponse<CourseResponse>>builder()
                .message("Search Course")
                .data(paged)
                .build();
    }

    public static Specification<Course> containsKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) return null;

            String like = "%" + keyword.toLowerCase() + "%";

            // Fields ở Course
            Expression<String> name = cb.lower(cb.coalesce(root.get("name"), ""));
            Expression<String> description = cb.lower(cb.coalesce(root.get("description"), ""));

            // Join Author + Category để search theo tên
            Join<Object, Object> authorJoin = root.join("author", JoinType.LEFT);
            Join<Object, Object> categoryJoin = root.join("category", JoinType.LEFT);

            Expression<String> authorName = cb.lower(cb.coalesce(authorJoin.get("name"), ""));
            Expression<String> categoryName = cb.lower(cb.coalesce(categoryJoin.get("name"), ""));

            return cb.or(
                    cb.like(name, like),
                    cb.like(description, like),
                    cb.like(authorName, like),
                    cb.like(categoryName, like)
            );
        };
    }
}

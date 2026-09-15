package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.Category;
import com.example.khoahocdrive.models.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course,Long>, JpaSpecificationExecutor<Course> {
    Optional<Course> findCourseByName(String name);
    Optional<Course> findCourseBySlug(String slug);
    Optional<Course> findFirstByIsFullCourseTrueOrderByIdDesc();

    // ✅ Fix N+1 cho getAll(page,size)
    @Override
    @EntityGraph(attributePaths = {"author", "category"})
    Page<Course> findAll(Pageable pageable);

    // ✅ Fix N+1 + paginate DB cho getAllByCategoryId(...)
    @EntityGraph(attributePaths = {"author", "category"})
    Page<Course> findByCategory_Name(String name, Pageable pageable);

    // ✅ Fix N+1 cho Search (Specification + Pageable)
    @Override
    @EntityGraph(attributePaths = {"author", "category"})
    Page<Course> findAll(Specification<Course> spec, Pageable pageable);
}

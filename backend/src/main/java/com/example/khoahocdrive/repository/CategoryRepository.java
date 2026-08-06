package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.Category;
import com.example.khoahocdrive.models.Course;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category,Long> {
    Optional<Category> findCategoryByName(String name);
}

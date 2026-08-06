package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.CourseFree;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseFreeRepository extends JpaRepository<CourseFree, Long>, JpaSpecificationExecutor<CourseFree> {

    Page<CourseFree> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title, String description, Pageable pageable
    );

    Page<CourseFree> findByCategory(String category, Pageable pageable);
}

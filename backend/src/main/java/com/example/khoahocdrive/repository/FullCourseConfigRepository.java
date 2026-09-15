package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.FullCourseConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FullCourseConfigRepository extends JpaRepository<FullCourseConfig, Long> {
}

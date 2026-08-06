package com.example.khoahocdrive.english48ngay.repository;

import com.example.khoahocdrive.english48ngay.entity.CourseStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseStudentRepository extends JpaRepository<CourseStudent, Long> {
    Optional<CourseStudent> findByUsername(String username);
    boolean existsByUsername(String username);
    org.springframework.data.domain.Page<CourseStudent> findByNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(String name, String username, org.springframework.data.domain.Pageable pageable);
}

package com.example.khoahocdrive.english48ngay.repository;

import com.example.khoahocdrive.english48ngay.entity.CourseDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseDayRepository extends JpaRepository<CourseDay, Long> {
    Optional<CourseDay> findByDay(Integer day);
    boolean existsByDay(Integer day);
}

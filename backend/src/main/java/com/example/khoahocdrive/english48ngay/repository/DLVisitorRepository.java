package com.example.khoahocdrive.english48ngay.repository;

import com.example.khoahocdrive.english48ngay.entity.DLVisitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DLVisitorRepository extends JpaRepository<DLVisitor, Long> {
    Optional<DLVisitor> findByVisitDate(LocalDate date);
}

package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.FreePointHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreePointHistoryRepository extends JpaRepository<FreePointHistory, Long> {
    List<FreePointHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<FreePointHistory> findAllByOrderByCreatedAtDesc();
}

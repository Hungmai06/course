package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.FreeLearnedHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreeLearnedHistoryRepository extends JpaRepository<FreeLearnedHistory, Long> {
    List<FreeLearnedHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<FreeLearnedHistory> findAllByOrderByCreatedAtDesc();
}

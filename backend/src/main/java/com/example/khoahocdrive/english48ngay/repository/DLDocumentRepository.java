package com.example.khoahocdrive.english48ngay.repository;

import com.example.khoahocdrive.english48ngay.entity.DLDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DLDocumentRepository extends JpaRepository<DLDocument, Long> {
    List<DLDocument> findByCategoryId(Long categoryId);
    org.springframework.data.domain.Page<DLDocument> findByCategoryId(Long categoryId, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<DLDocument> findByTitleContainingIgnoreCase(String title, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<DLDocument> findByCategoryIdAndTitleContainingIgnoreCase(Long categoryId, String title, org.springframework.data.domain.Pageable pageable);
}

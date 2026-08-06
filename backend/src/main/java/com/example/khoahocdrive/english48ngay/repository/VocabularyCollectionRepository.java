package com.example.khoahocdrive.english48ngay.repository;

import com.example.khoahocdrive.english48ngay.entity.VocabularyCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VocabularyCollectionRepository extends JpaRepository<VocabularyCollection, Long> {
}

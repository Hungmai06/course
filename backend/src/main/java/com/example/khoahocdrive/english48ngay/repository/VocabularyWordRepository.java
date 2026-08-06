package com.example.khoahocdrive.english48ngay.repository;

import com.example.khoahocdrive.english48ngay.entity.VocabularyWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularyWordRepository extends JpaRepository<VocabularyWord, Long> {
    List<VocabularyWord> findByCourseDayId(Long courseDayId);
}

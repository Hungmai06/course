package com.example.khoahocdrive.english48ngay.repository;

import com.example.khoahocdrive.english48ngay.entity.VocabularySubtopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularySubtopicRepository extends JpaRepository<VocabularySubtopic, Long> {
    List<VocabularySubtopic> findByTopicId(Long topicId);
}

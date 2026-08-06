package com.example.khoahocdrive.english48ngay.repository;

import com.example.khoahocdrive.english48ngay.entity.DLVocabularyWord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DLVocabularyWordRepository extends JpaRepository<DLVocabularyWord, Long> {
    List<DLVocabularyWord> findBySubtopicId(Long subtopicId);
    
    Page<DLVocabularyWord> findBySubtopicId(Long subtopicId, Pageable pageable);
    
    Page<DLVocabularyWord> findByWordContainingIgnoreCase(String word, Pageable pageable);
    
    Page<DLVocabularyWord> findBySubtopicIdAndWordContainingIgnoreCase(Long subtopicId, String word, Pageable pageable);

    boolean existsBySubtopicIdAndWordIgnoreCase(Long subtopicId, String word);

    long countBySubtopicTopicId(Long topicId);

    long countBySubtopicTopicCollectionId(Long collectionId);
}

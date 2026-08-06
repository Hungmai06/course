package com.example.khoahocdrive.english48ngay.repository;

import com.example.khoahocdrive.english48ngay.entity.UserVocabularyProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserVocabularyProgressRepository extends JpaRepository<UserVocabularyProgress, Long> {
    List<UserVocabularyProgress> findByUsername(String username);
    Optional<UserVocabularyProgress> findByUsernameAndSubtopicId(String username, Long subtopicId);
}

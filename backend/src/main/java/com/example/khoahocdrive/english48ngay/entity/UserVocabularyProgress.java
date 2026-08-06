package com.example.khoahocdrive.english48ngay.entity;

import com.example.khoahocdrive.models.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "dl_user_vocabulary_progress",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"username", "subtopic_id"})}
)
public class UserVocabularyProgress extends AbstractEntity {

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "subtopic_id", nullable = false)
    private Long subtopicId;

    @Column(name = "learned_word_ids", length = 4000)
    private String learnedWordIds; // comma-separated e.g. "1,2,5"

    @Column(name = "awarded_word_ids", length = 4000)
    private String awardedWordIds; // comma-separated e.g. "1,2,5"
}

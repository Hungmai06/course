package com.example.khoahocdrive.english48ngay.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.khoahocdrive.models.AbstractEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dl_vocabulary_words_detail")
public class DLVocabularyWord extends AbstractEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subtopic_id", nullable = false)
    @JsonIgnore
    private VocabularySubtopic subtopic;

    @Column(name = "word", nullable = false)
    private String word;

    @Column(name = "pronunciation")
    private String pronunciation;

    @Column(name = "meaning", nullable = false)
    private String meaning;
}

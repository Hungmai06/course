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
@Table(name = "vocabulary_words")
public class VocabularyWord extends AbstractEntity {

    @Column(name = "vocab_id")
    private String vocabId; // e.g. "d1-v2"

    @Column(name = "word", nullable = false)
    private String word;

    @Column(name = "phonetic")
    private String phonetic;

    @Column(name = "meaning", nullable = false)
    private String meaning;

    @Column(name = "example", length = 1000)
    private String example;

    @Column(name = "example_meaning", length = 1000)
    private String exampleMeaning;

    @Column(name = "options_list", length = 1000)
    private String optionsList; // Semicolon-separated e.g. "tôi;bạn;họ;nó"

    @Column(name = "correct_answer")
    private String correctAnswer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_day_id")
    @JsonIgnore
    private CourseDay courseDay;
}

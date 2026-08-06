package com.example.khoahocdrive.english48ngay.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.khoahocdrive.models.AbstractEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dl_vocabulary_subtopics")
public class VocabularySubtopic extends AbstractEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnore
    private VocabularyTopic topic;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @OneToMany(mappedBy = "subtopic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DLVocabularyWord> words;
}

package com.example.khoahocdrive.english48ngay.entity;

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
@Table(name = "course_days")
public class CourseDay extends AbstractEntity {

    @Column(name = "day", unique = true, nullable = false)
    private Integer day;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "video_url", length = 1000)
    private String videoUrl;

    @Column(name = "document_url", length = 1000)
    private String documentUrl;

    @Column(name = "exercise_url", length = 1000)
    private String exerciseUrl;

    @Column(name = "answer_url", length = 1000)
    private String answerUrl;

    @OneToMany(mappedBy = "courseDay", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VocabularyWord> vocabularies;
}

package com.example.khoahocdrive.english48ngay.entity;

import com.example.khoahocdrive.models.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "student_progress",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"username", "day"})}
)
public class StudentProgress extends AbstractEntity {

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "day", nullable = false)
    private Integer day;

    @Column(name = "status", nullable = false)
    private String status; // "not_started", "in_progress", "completed"

    @Column(name = "vocab_learned")
    private Boolean vocabLearned;
}

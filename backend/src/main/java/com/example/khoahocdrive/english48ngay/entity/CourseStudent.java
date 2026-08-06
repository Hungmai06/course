package com.example.khoahocdrive.english48ngay.entity;

import com.example.khoahocdrive.models.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "course_students")
public class CourseStudent extends AbstractEntity {

    @Column(name = "username", unique = true, nullable = false)
    @NotNull
    private String username;

    @Column(name = "name", nullable = false)
    @NotNull
    private String name;

    @Column(name = "class_name")
    private String className;
}

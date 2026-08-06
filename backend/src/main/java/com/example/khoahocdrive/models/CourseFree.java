package com.example.khoahocdrive.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "course_free")
public class CourseFree extends AbstractEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "category")
    private String category;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "link", columnDefinition = "TEXT")
    private String link;

    @Column(name = "items_json", columnDefinition = "TEXT")
    private String itemsJson;

    @Column(name = "views")
    @Builder.Default
    private Long views = 0L;
}

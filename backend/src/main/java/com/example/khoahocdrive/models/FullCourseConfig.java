package com.example.khoahocdrive.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "full_course_config")
public class FullCourseConfig {

    @Id
    @Builder.Default
    private Long id = 1L;

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "old_price", precision = 10, scale = 2)
    private BigDecimal oldPrice;

    @Column(name = "new_price", precision = 10, scale = 2)
    private BigDecimal newPrice;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "link_drive")
    private String linkDrive;

    @Column(name = "link_drive_2")
    private String linkDrive2;

    @Column(name = "link_test")
    private String linkTest;

    @Column(name = "link_test_2")
    private String linkTest2;

    @Column(name = "is_full_course")
    @Builder.Default
    private Boolean isFullCourse = true;
}

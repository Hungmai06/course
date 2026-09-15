package com.example.khoahocdrive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private String avatar;
    private Float rating;
    private Float ratingCount;
    private Float studentCount;
    private String linkDrive;
    private String linkDrive2;
    private String linkTest;
    private String linkTest2;
    private Boolean isFullCourse;
    private String nameAuthor;
    private String nameCategory;
    private String slug;
}

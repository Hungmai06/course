package com.example.khoahocdrive.english48ngay.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentCategoryResponse {
    private Long id;
    private String name;
    private String icon;
    private int documentCount;
}

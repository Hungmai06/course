package com.example.khoahocdrive.english48ngay.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyCollectionRequest {
    private String title;
    private String description;
    private String icon;
    private String color;
}

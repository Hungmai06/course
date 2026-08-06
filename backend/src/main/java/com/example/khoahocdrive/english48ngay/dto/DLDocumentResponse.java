package com.example.khoahocdrive.english48ngay.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DLDocumentResponse {
    private Long id;
    private Long categoryId;
    private String title;
    private String description;
    private Integer views;
    private String downloadUrl;
}

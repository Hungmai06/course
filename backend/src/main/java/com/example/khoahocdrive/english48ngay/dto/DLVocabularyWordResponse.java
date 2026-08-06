package com.example.khoahocdrive.english48ngay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DLVocabularyWordResponse {
    private Long id;
    private Long subtopicId;
    private String word;
    private String pronunciation;
    private String meaning;
}

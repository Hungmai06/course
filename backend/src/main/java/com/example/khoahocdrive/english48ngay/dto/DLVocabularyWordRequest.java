package com.example.khoahocdrive.english48ngay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DLVocabularyWordRequest {
    private String word;
    private String pronunciation;
    private String meaning;
}

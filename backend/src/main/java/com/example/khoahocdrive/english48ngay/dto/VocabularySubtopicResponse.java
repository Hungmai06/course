package com.example.khoahocdrive.english48ngay.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class VocabularySubtopicResponse {
    private Long id;
    private Long topicId;
    private String title;
    private String description;
    private Integer wordCount;
    private List<DLVocabularyWordResponse> words;
}

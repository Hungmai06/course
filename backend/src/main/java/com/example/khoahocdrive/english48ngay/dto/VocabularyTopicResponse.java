package com.example.khoahocdrive.english48ngay.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class VocabularyTopicResponse {
    private Long id;
    private Long collectionId;
    private String title;
    private String description;
    private Integer subtopicCount;
    private long wordCount;
    private List<VocabularySubtopicResponse> subtopics;
}

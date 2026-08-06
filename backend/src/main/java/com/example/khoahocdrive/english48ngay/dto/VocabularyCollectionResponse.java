package com.example.khoahocdrive.english48ngay.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyCollectionResponse {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private String color;
    private int topicCount;
    private long wordCount;
    private List<VocabularyTopicResponse> topics;
}

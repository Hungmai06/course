package com.example.khoahocdrive.english48ngay.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVocabularyProgressResponse {
    private Long id;
    private String username;
    private Long subtopicId;
    private String learnedWordIds;
    private String awardedWordIds;
}

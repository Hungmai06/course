package com.example.khoahocdrive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreeLearnedHistoryResponse {
    private Long id;
    private String username;
    private String email;
    private Long courseId;
    private String courseTitle;
    private String lessonTitle;
    private String date;
    private String time;
}

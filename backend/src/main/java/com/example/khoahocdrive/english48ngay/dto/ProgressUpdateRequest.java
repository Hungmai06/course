package com.example.khoahocdrive.english48ngay.dto;

import lombok.Data;

@Data
public class ProgressUpdateRequest {
    private String username;
    private Integer day;
    private String status;
    private Boolean vocabLearned;
}

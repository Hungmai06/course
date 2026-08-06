package com.example.khoahocdrive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreePointHistoryResponse {
    private Long id;
    private String username;
    private String email;
    private String action;
    private String points;
    private String date;
    private String time;
}

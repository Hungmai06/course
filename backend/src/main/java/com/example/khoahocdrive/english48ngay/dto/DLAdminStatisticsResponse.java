package com.example.khoahocdrive.english48ngay.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DLAdminStatisticsResponse {
    private Long totalUsers;
    private Long totalCollections;
    private Long totalSubCollections;
    private Long totalWords;
    private Long totalDocuments;
    private Long totalViews;
    private List<DailyStat> dailyRegistrations;
    private List<DailyStat> dailyVisitors;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyStat {
        private String day;
        private Long count;
    }
}

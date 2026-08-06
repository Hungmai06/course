package com.example.khoahocdrive.dto;

public interface RevenueSummaryDTO {
    String getMonth();         // Dùng cho thống kê theo tháng
    String getDay();           // Dùng cho thống kê theo ngày
    Long getTotalOrders();
    Double getTotalRevenue();
}

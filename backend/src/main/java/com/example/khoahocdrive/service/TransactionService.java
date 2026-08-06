package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.RevenueSummaryDTO;

import java.util.List;

public interface TransactionService {
    List<RevenueSummaryDTO> getMonthlyRevenue();
    List<RevenueSummaryDTO> getDailyRevenue(String month);
}

package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.RevenueSummaryDTO;
import com.example.khoahocdrive.service.TransactionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/revenue")
@Tag(name = "API TRANSACTION")
public class TransactionController {
    private final TransactionService transactionService;
    // API: Lấy doanh thu theo tháng
    @GetMapping("/monthly")

    public List<RevenueSummaryDTO> getMonthlyRevenue() {
        return transactionService.getMonthlyRevenue();
    }

    // API: Lấy doanh thu theo ngày trong 1 tháng cụ thể (format YYYY-MM)
    @GetMapping("/daily")

    public List<RevenueSummaryDTO> getDailyRevenue(@RequestParam String month) {
        return transactionService.getDailyRevenue(month);
    }
}

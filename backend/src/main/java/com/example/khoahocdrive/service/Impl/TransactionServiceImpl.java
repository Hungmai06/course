package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.RevenueSummaryDTO;
import com.example.khoahocdrive.repository.TransactionRepository;
import com.example.khoahocdrive.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    @Override
    public List<RevenueSummaryDTO> getMonthlyRevenue() {
        return transactionRepository.getMonthlyRevenueSummary();
    }

    @Override
    public List<RevenueSummaryDTO> getDailyRevenue(String month) {
        return transactionRepository.getDailyRevenueByMonth(month);
    }
}

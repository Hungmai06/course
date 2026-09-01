package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.ConfirmRequest;
import com.example.khoahocdrive.models.Bill;

import java.math.BigDecimal;
import java.util.Map;

public interface VietQrService {
    String createQrPayment(Long orderId,BigDecimal amount,String description);
    void confirmBill(Bill bill);
    boolean checkPaymentStatus(String description);
}


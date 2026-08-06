package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.OrderDetailRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.OrderDetailResponse;

import java.util.List;

public interface OrderDetailService {
    ApiResponse<OrderDetailResponse> create (OrderDetailRequest request);
    ApiResponse<List<OrderDetailResponse>> getByOrderId(Long orderId);
    ApiResponse<OrderDetailResponse>getOrderDetailById(Long id);

}

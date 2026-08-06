package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.OrderRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.OrderResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.dto.response.UserResponse;
import com.example.khoahocdrive.supports.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    ApiResponse<OrderResponse> create(OrderRequest request);
    ApiResponse<List<OrderResponse>>getAllByUserName(String username);
    ApiResponse<OrderResponse> getById(Long id);
    ApiResponse<OrderResponse> update(Long orderId, OrderStatus status);
    ApiResponse<PagedResponse<OrderResponse>> getAll(int page, int size, String sortBy, String sortDir);
    ApiResponse<PagedResponse<OrderResponse>> findOrder(int page, int size,String  keyword, String sortBy, String sortDir);
    void deleteOrder();
    ApiResponse<OrderResponse> updateEmail(Long orderId, String email);
}

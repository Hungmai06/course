package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.CartItemRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CartItemResponse;
import com.example.khoahocdrive.dto.response.CartResponse;

public interface CartService {
     ApiResponse<CartResponse> getCart(Long  userId);
     ApiResponse<CartItemResponse> addCart(Long userId,CartItemRequest request);
     ApiResponse<CartItemResponse> update(Long userId, Long productId, Integer quantity);
     void deleteItemForCart(Long userId,Long productId);
     void clearCart(Long userId);
}

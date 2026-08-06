package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.ItemRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.ItemResponse;

import java.util.List;

public interface ItemService {
    ApiResponse<ItemResponse> findItemById(Long id);
    ApiResponse<ItemResponse> create(ItemRequest request);
    ApiResponse<ItemResponse> update(Long id, ItemRequest request);
    void delete(Long id);
    ApiResponse<List<ItemResponse>> getAll();
}

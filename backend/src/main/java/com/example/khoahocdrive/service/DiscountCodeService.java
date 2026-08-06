package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.DiscountCodeRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.DiscountCodeResponse;

import java.util.List;

public interface DiscountCodeService {
    ApiResponse<DiscountCodeResponse> create (DiscountCodeRequest request);
    ApiResponse<DiscountCodeResponse> update(Long id,DiscountCodeRequest request);
    ApiResponse<DiscountCodeResponse> findDiscountCodeById(Long id);
    ApiResponse<List<DiscountCodeResponse>> getAll();
    void delete( Long id);
}

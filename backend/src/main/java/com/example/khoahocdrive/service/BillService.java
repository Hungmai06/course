package com.example.khoahocdrive.service;


import com.example.khoahocdrive.dto.response.BillItemResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;

public interface BillService {
    PagedResponse<BillItemResponse> getBills(int page, int size, String sortBy, String sortDir);
}
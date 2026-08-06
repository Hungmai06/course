package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.BillItemResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @GetMapping
    public ApiResponse<PagedResponse<BillItemResponse>> getBills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.<PagedResponse<BillItemResponse>>builder()
                .data(billService.getBills(page, size, sortBy, sortDir))
                .message("Get bills successfully")
                .code(200)
                .build();
    }
}

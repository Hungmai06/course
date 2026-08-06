package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.OrderDetailRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.OrderDetailResponse;
import com.example.khoahocdrive.service.OrderDetailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order_detail")
@Tag(name = "ORDER DETAIL API")
@RequiredArgsConstructor
public class OrderDetailController {
    private final OrderDetailService orderDetailService;
    @PostMapping("/")
    @Operation(summary = "Create Order detail")
    public ApiResponse<OrderDetailResponse> create(@RequestBody OrderDetailRequest request){
        return orderDetailService.create(request);
    }

    @GetMapping("/order/{orderId}/details")
    @Operation(summary = "Find by OrderId")
    public ApiResponse<List<OrderDetailResponse>> getOrderDetailByOrderId(@PathVariable Long orderId){
        return orderDetailService.getByOrderId(orderId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Find By id")
    public ApiResponse<OrderDetailResponse> findById(@PathVariable Long id){
        return orderDetailService.getOrderDetailById(id);
    }

}

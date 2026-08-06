package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.OrderRequest;
import com.example.khoahocdrive.dto.request.UpdateEmailOrder;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.OrderResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.service.OrderService;
import com.example.khoahocdrive.supports.enums.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.RouterOperations;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order")
@RequiredArgsConstructor
@Tag(name = "ORDER API")
public class OrderController {
    private final OrderService orderService;
    @PostMapping("/")
    @Operation(summary = "Create Order")
    public ApiResponse<OrderResponse> create(@RequestBody OrderRequest request){
        return orderService.create(request);
    }

    @GetMapping("/")
    @Operation(summary = "Get Order By Username")
    public ApiResponse<List<OrderResponse>> getAllOrder(@AuthenticationPrincipal UserDetails user){
        return orderService.getAllByUserName(user.getUsername());
    }
    @GetMapping("/g")
    @Operation(summary = "Get All Order")
    public ApiResponse<PagedResponse<OrderResponse>> getAllOrders(@RequestParam int page, @RequestParam int size,@RequestParam(defaultValue = "id") String sortBy,
                                                                  @RequestParam(defaultValue = "desc") String sortDir){
        return orderService.getAll(page,size,sortBy,sortDir);
    }
    @GetMapping("/s")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Search Order")
    public ApiResponse<PagedResponse<OrderResponse>> search(@RequestParam int page, @RequestParam int size,@RequestParam String keyword,@RequestParam(defaultValue = "id") String sortBy,
                                                            @RequestParam(defaultValue = "desc") String sortDir){
        return orderService.findOrder(page,size,keyword,sortBy,sortDir);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Get Order By id")
    public ApiResponse<OrderResponse> findOrderById(@PathVariable Long id){
        return orderService.getById(id);
    }

    @PutMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update Status Order")
    public ApiResponse<OrderResponse> update(@PathVariable Long orderId, @RequestParam OrderStatus status){
        return orderService.update(orderId,status);
    }
    @PutMapping("/email/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update Email Order")
    public ApiResponse<OrderResponse> updateEmail(@PathVariable Long orderId, @RequestBody UpdateEmailOrder request){
        return orderService.updateEmail(orderId,request.getEmail());
    }
}

package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.DiscountCodeRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.DiscountCodeResponse;
import com.example.khoahocdrive.service.DiscountCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/discount_code")
@RequiredArgsConstructor
@Tag(name = "Discount Code API")
public class DiscountCodeController {
    private final DiscountCodeService discountCodeService;

    @GetMapping("/{id}")
    @Operation(summary = "Find Discount Code Id")
    public ApiResponse<DiscountCodeResponse> getDiscountCodeById(@PathVariable Long id){
        return discountCodeService.findDiscountCodeById(id);
    }
    @GetMapping("/")
    @Operation(summary = "Get all discount code")
    public ApiResponse<List<DiscountCodeResponse>> getAll(){
        return discountCodeService.getAll();
    }

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Create Discount Code ")
    public ApiResponse<DiscountCodeResponse> create(@RequestBody DiscountCodeRequest request){
        return discountCodeService.create(request);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update Discount Code")
    public ApiResponse<DiscountCodeResponse> update(@PathVariable Long id, @RequestBody DiscountCodeRequest request){
        return discountCodeService.update(id,request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Delete Discount code By id")
    public void delete(@PathVariable Long id){
        discountCodeService.delete(id);
    }
}

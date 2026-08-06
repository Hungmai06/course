package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.CartItemRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CartItemResponse;
import com.example.khoahocdrive.dto.response.CartResponse;
import com.example.khoahocdrive.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping("/{userId}")
    @Operation(summary = "Get Cart")
    public ApiResponse<CartResponse> getCart(@PathVariable Long userId){
        return cartService.getCart(userId);
    }

    @PostMapping("/{userId}")
    @Operation(summary = "Add Course To Cart")
    public ApiResponse<CartItemResponse> addCart(@PathVariable Long userId, @RequestBody CartItemRequest request){
        return cartService.addCart(userId, request);
    }
    @PutMapping("/{userId}/update/{productId}")
    @Operation(summary = "Update Cart Item")
    public ApiResponse<CartItemResponse> update(@PathVariable Long userId, @PathVariable Long productId, @RequestParam Integer quantity){
        return cartService.update(userId,productId,quantity);
    }
    @DeleteMapping("/{userId}/delete/{productId}")
    @Operation(summary = "Delete Cart Item")
    public void delete(@PathVariable Long userId, @PathVariable Long productId){
        cartService.deleteItemForCart(userId,productId);
    }
    @DeleteMapping("/")
    @Operation(summary = "Clear Cart")
    public  void clearCart(Long userId){
        cartService.clearCart(userId);
    }

}

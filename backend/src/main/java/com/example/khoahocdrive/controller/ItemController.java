package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.ItemRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.ItemResponse;
import com.example.khoahocdrive.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping("/{id}")
    public ApiResponse<ItemResponse> getItemById(@PathVariable Long id) {
        return itemService.findItemById(id);
    }

    @GetMapping
    public ApiResponse<List<ItemResponse>> getAllItems() {
        return itemService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ItemResponse> createItem(@RequestBody ItemRequest request) {
        return itemService.create(request);
    }

    @PutMapping("/{id}")
    public ApiResponse<ItemResponse> updateItem(
            @PathVariable Long id,
            @RequestBody ItemRequest request
    ) {
        return itemService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id) {
        itemService.delete(id);
    }
}

package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.ItemRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.ItemResponse;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.mapper.ItemMapper;
import com.example.khoahocdrive.models.Item;
import com.example.khoahocdrive.repository.ItemRepository;
import com.example.khoahocdrive.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;

    @Override
    public ApiResponse<ItemResponse> findItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        return ApiResponse.<ItemResponse>builder()
                .message("Find Item By Id")
                .data(itemMapper.toResponse(item))
                .build();
    }

    @Override
    public ApiResponse<ItemResponse> create(ItemRequest request) {
        if (itemRepository.findItemByItemName(request.getItemName()).isPresent()) {
            throw new InvalidDataException("Item Existed");
        }

        Item item = Item.builder()
                .itemName(request.getItemName())
                .build();

        itemRepository.save(item);

        return ApiResponse.<ItemResponse>builder()
                .message("Create Item Successfully")
                .data(itemMapper.toResponse(item))
                .build();
    }

    @Override
    public ApiResponse<ItemResponse> update(Long id, ItemRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        item.setItemName(request.getItemName());

        itemRepository.save(item);

        return ApiResponse.<ItemResponse>builder()
                .message("Update Item")
                .data(itemMapper.toResponse(item))
                .build();
    }

    @Override
    public ApiResponse<List<ItemResponse>> getAll() {
        List<ItemResponse> itemResponses = itemRepository.findAll()
                .stream()
                .map(itemMapper::toResponse)
                .toList();

        return ApiResponse.<List<ItemResponse>>builder()
                .message("Get all Item")
                .data(itemResponses)
                .build();
    }

    @Override
    public void delete(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Item not found");
        }
        itemRepository.deleteById(id);
    }
}

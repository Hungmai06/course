package com.example.khoahocdrive.mapper;

import com.example.khoahocdrive.dto.response.ItemResponse;
import com.example.khoahocdrive.models.Item;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface ItemMapper {
    ItemResponse toResponse(Item item);
}

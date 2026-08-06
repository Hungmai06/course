package com.example.khoahocdrive.mapper;

import com.example.khoahocdrive.dto.response.DiscountCodeResponse;
import com.example.khoahocdrive.models.DiscountCode;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface DiscountCodeMapper {
    DiscountCodeResponse toResponse(DiscountCode discountCode);
}

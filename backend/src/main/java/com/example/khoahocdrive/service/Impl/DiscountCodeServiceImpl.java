package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.DiscountCodeRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.DiscountCodeResponse;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.mapper.DiscountCodeMapper;
import com.example.khoahocdrive.models.DiscountCode;
import com.example.khoahocdrive.repository.DiscountCodeRepository;
import com.example.khoahocdrive.service.DiscountCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class DiscountCodeServiceImpl implements DiscountCodeService {
    private final DiscountCodeRepository discountCodeRepository;
    private final DiscountCodeMapper discountCodeMapper;

    @Override
    public ApiResponse<DiscountCodeResponse> create(DiscountCodeRequest request) {
        if(discountCodeRepository.findDiscountCodeByCode(request.getCode()).isPresent()){
            throw new InvalidDataException("Code existed");
        }
        DiscountCode discountCode = DiscountCode.builder()
                .code(request.getCode())
                .discountPercent(request.getDiscountPercent())
                .startDate(request.getStartDate())
                .minimumOrder(request.getMinimumOrder())
                .expiredDate(request.getExpiredDate())
                .active(request.getActive())
                .build();
        discountCodeRepository.save(discountCode);
        return ApiResponse.<DiscountCodeResponse>builder()
                .message("Create Discount Code successfully")
                .data(discountCodeMapper.toResponse(discountCode))
                .build();
    }

    @Override
    public ApiResponse<DiscountCodeResponse> update(Long id, DiscountCodeRequest request) {
        DiscountCode discountCode = discountCodeRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Discount Code Not Found")
        );
        discountCode.setCode(request.getCode());
        discountCode.setDiscountPercent(request.getDiscountPercent());
        discountCode.setStartDate(request.getStartDate());
        discountCode.setMinimumOrder(request.getMinimumOrder());
        discountCode.setExpiredDate(request.getExpiredDate());
        discountCode.setActive(request.getActive());
        discountCodeRepository.save(discountCode);
        return ApiResponse.<DiscountCodeResponse>builder()
                .message("Update discount Code")
                .data(discountCodeMapper.toResponse(discountCode))
                .build();
    }

    @Override
    public ApiResponse<DiscountCodeResponse> findDiscountCodeById(Long id) {
        DiscountCode discountCode = discountCodeRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Discount code not found")
        );
        return ApiResponse.<DiscountCodeResponse>builder()
                .data(discountCodeMapper.toResponse(discountCode))
                .message("Find Discount code By Id")
                .build();
    }

    @Override
    public ApiResponse<List<DiscountCodeResponse>> getAll() {
        List<DiscountCode> list = discountCodeRepository.findAll();
        List<DiscountCodeResponse > discountCodeResponses = list.stream().map(discountCodeMapper::toResponse).toList();
        return ApiResponse.<List<DiscountCodeResponse>>builder()
                .message("Get all DiscountCode")
                .data(discountCodeResponses)
                .build();
    }

    @Override
    public void delete(Long id) {
        DiscountCode discountCode = discountCodeRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Discount code not found")
        );
        discountCode.setActive(false);
        discountCodeRepository.save(discountCode);
    }
}

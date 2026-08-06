package com.example.khoahocdrive.service.Impl;


import com.example.khoahocdrive.dto.response.BillItemResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.models.Bill;
import com.example.khoahocdrive.repository.BillRepository;
import com.example.khoahocdrive.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;

    @Override
    public PagedResponse<BillItemResponse> getBills(int page, int size, String sortBy, String sortDir) {
        Sort sort = "desc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Bill> billPage = billRepository.findAll(pageable);

        List<BillItemResponse> items = billPage.getContent().stream()
                .map(b -> BillItemResponse.builder()
                        .id(b.getId())
                        .amount(b.getAmount())
                        .description(b.getDescription())
                        .createdAt(b.getCreatedAt())
                        .build()
                )
                .toList();

        return PagedResponse.<BillItemResponse>builder()
                .content(items)
                .pageNumber(billPage.getNumber())
                .pageSize(billPage.getSize())
                .totalElements(billPage.getTotalElements())
                .totalPages(billPage.getTotalPages())
                .build();
    }
}
package com.example.khoahocdrive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {
    private Long id;
    private Long orderId;
    private Long courseId;
    private Integer quantity;
    private String courseName;
    private String avatar;
    private BigDecimal coursePrice;
    private BigDecimal totalPrice;
}

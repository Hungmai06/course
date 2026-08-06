package com.example.khoahocdrive.dto.response;

import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCodeResponse {
    private Long id;

    private String code;

    private BigDecimal discountPercent;

    private Double minimumOrder;

    @Temporal(TemporalType.TIMESTAMP)
    private Date expiredDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;

    private Boolean active;
}
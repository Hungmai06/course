package com.example.khoahocdrive.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillItemResponse {
    private Long id;
    private BigDecimal amount;
    private String description;
    private Date createdAt;
}
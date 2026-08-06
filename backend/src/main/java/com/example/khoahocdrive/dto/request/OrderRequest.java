package com.example.khoahocdrive.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest implements Serializable {
    private Long userId;
    private List<Long> courseIds;
    private String couponCode;
    private String fullName;
    @Email
    private String email;
    private String phone;
    private String description;
}

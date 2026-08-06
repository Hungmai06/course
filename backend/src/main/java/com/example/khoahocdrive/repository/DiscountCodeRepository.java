package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiscountCodeRepository extends JpaRepository<DiscountCode,Long> {
    Optional<DiscountCode> findDiscountCodeByCode(String code);
}

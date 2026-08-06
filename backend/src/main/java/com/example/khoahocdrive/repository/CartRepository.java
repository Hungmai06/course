package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Long> {
    Optional<Cart> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}

package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem,Long> {

    Optional<CartItem> findByCartIdAndCourseId(Long cartId, Long courseId);
    List<CartItem> findAllByCartId(Long cartId);
    void deleteByCartId(Long cartId);
    List<CartItem> findByCourseId(Long courseId);
}

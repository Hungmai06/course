package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.Order;
import com.example.khoahocdrive.supports.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ✅ Fetch đủ để toResponse không kích hoạt lazy
    @EntityGraph(attributePaths = {
            "orderDetails",
            "orderDetails.course",
            "orderDetails.course.author",
            "orderDetails.course.category",
            "discountCode"
    })
    List<Order> findByUserUsername(String username);

    // ✅ Dùng cho getMyCourse(userId) (bạn đã có, mình thêm discountCode cho chắc)
    @EntityGraph(attributePaths = {
            "orderDetails",
            "orderDetails.course",
            "orderDetails.course.author",
            "orderDetails.course.category",
            "discountCode"
    })
    List<Order> findByUserId(Long userId);

    // ✅ Fix N+1 cho getAll(page,size)
    @Override
    @EntityGraph(attributePaths = {
            "orderDetails",
            "orderDetails.course",
            "orderDetails.course.author",
            "orderDetails.course.category",
            "discountCode"
    })
    Page<Order> findAll(Pageable pageable);

    // ✅ Fix N+1 cho getById(id)
    @Override
    @EntityGraph(attributePaths = {
            "user",
            "orderDetails",
            "orderDetails.course",
            "orderDetails.course.author",
            "orderDetails.course.category",
            "discountCode",
            "transaction"
    })
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = {
            "orderDetails",
            "orderDetails.course",
            "orderDetails.course.author",
            "orderDetails.course.category",
            "discountCode"
    })
    @Query("""
    SELECT o FROM Order o
    WHERE LOWER(o.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(o.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(o.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(FUNCTION('to_char', o.createdAt, 'YYYY-MM-DD HH24:MI:SS')) LIKE LOWER(CONCAT('%', :keyword, '%'))
""")
    Page<Order> findOrder(@Param("keyword") String keyword, Pageable pageable);

    Optional<Order> findByDescription(String description);
    @Query("""
SELECT o FROM Order o
WHERE :billDesc LIKE CONCAT('%', o.description, '%')
  AND o.status = 'PENDING'
""")
    Optional<Order> findByBillDescription(String billDesc);

    @Query(value = """
        SELECT * FROM orders
        WHERE status = 'PENDING'
          AND created_at <= NOW() - INTERVAL '30 minutes'
        """, nativeQuery = true)
    List<Order> findOrderByStatus();

    List<Order> findByEmailAndStatus(String email, OrderStatus status);
}

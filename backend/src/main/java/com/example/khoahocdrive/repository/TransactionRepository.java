package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.dto.RevenueSummaryDTO;
import com.example.khoahocdrive.models.Order;
import com.example.khoahocdrive.models.Transaction;
import com.example.khoahocdrive.supports.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction,Long> {
    Optional<Transaction> findByTransactionRef(String transactionRef);
    List<Transaction> findByOrder(Order order);
    Optional<Transaction> findByOrderId(Long orderId);
    @Query(value = """
        SELECT 
            TO_CHAR(t.created_at, 'YYYY-MM') AS month,
            COUNT(*) AS totalOrders,
            SUM(t.amount) AS totalRevenue
        FROM 
            transactions t
        WHERE 
            t.status = 'SUCCESS'
        GROUP BY 
            TO_CHAR(t.created_at, 'YYYY-MM')
        ORDER BY 
            month DESC
        """, nativeQuery = true)
    List<RevenueSummaryDTO> getMonthlyRevenueSummary();

    // Doanh thu theo ngày trong một tháng
    @Query(value = """
        SELECT 
            TO_CHAR(t.created_at, 'YYYY-MM-DD') AS day,
            COUNT(*) AS totalOrders,
            SUM(t.amount) AS totalRevenue
        FROM 
            transactions t
        WHERE 
            t.status = 'SUCCESS'
            AND TO_CHAR(t.created_at, 'YYYY-MM') = :month
        GROUP BY 
            TO_CHAR(t.created_at, 'YYYY-MM-DD')
        ORDER BY 
            day ASC
        """, nativeQuery = true)
    List<RevenueSummaryDTO> getDailyRevenueByMonth(@Param("month") String month);

    List<Transaction> findByStatus(TransactionStatus status);
}

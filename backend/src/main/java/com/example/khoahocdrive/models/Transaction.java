package com.example.khoahocdrive.models;

import com.example.khoahocdrive.supports.enums.TransactionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "transactions")
public class Transaction extends AbstractEntity {
    @Column(name = "transaction_ref", nullable = false, unique = true)
    private String transactionRef;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;
}

package com.example.khoahocdrive.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Date;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "bill",
        indexes = {
                @Index(name = "idx_bill_processed", columnList = "processed"),
                @Index(name = "idx_bill_message_id", columnList = "message_id", unique = true)
        }
)
public class Bill extends AbstractEntity{
    @Column(unique = true)
    private String messageId;

    @Column(length = 5000)
    private String description;

    @Column(length = 5000)
    private BigDecimal amount;

    @Temporal(TemporalType.TIMESTAMP)
    private Date sentDate;

    @Column(name = "processed")
    private Boolean processed;
}

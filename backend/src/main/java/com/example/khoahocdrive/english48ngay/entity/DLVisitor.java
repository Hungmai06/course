package com.example.khoahocdrive.english48ngay.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "dl_visitors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DLVisitor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visit_date", unique = true, nullable = false)
    private LocalDate visitDate;

    @Column(name = "count", nullable = false)
    private Long count;
}

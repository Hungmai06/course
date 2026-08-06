package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    @Query("select b.messageId from Bill b where b.messageId in :ids")
    List<String> findExistingMessageIds(@Param("ids") Collection<String> ids);
    Optional<Bill> findByDescriptionContaining(String description);

}

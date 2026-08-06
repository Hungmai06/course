package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.User;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByReferralCode(String referralCode);

    @Query("""
    SELECT u FROM User u
    WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
""")
   List<User> findUserByCredential(String keyword);
}

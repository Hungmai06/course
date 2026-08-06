package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.Social;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocialRepository extends JpaRepository<Social,Long> {
    Optional<Social> findByPlatform(String platform);
}

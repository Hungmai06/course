package com.example.khoahocdrive.repository;

import com.example.khoahocdrive.models.Author;
import com.example.khoahocdrive.models.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findItemByItemName(String itemName);

}

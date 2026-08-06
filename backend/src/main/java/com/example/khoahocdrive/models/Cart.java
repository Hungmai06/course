package com.example.khoahocdrive.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "carts")
public class Cart extends AbstractEntity{

    @OneToOne
    @JoinColumn(name = "user_id",nullable = true)
    private User user;

    @OneToMany(mappedBy = "cart",cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CartItem> cartItems;

}

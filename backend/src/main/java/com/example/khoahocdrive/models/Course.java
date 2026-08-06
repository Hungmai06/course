package com.example.khoahocdrive.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Set;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "courses")
public class Course extends AbstractEntity{

    @Column(name = "name",nullable = false)
    private String name;

    @Column(name = "description",columnDefinition = "TEXT")
    private String description;

    @Column(name = "old_price",nullable = false,precision = 10, scale = 2)
    @NotNull
    private BigDecimal oldPrice;

    @Column(name = "new_price",nullable = false, precision = 10,scale = 2)
    @NotNull
    private BigDecimal newPrice;

    @Column(name = "avatar",nullable = false)
    private String avatar;

    @Column(name = "link_drive")
    @NotNull
    private String linkDrive;

    @Column(name = "link_test")
    @NotNull
    private String linkTest;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private Author author;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "slug")
    private String slug;


    @OneToMany(mappedBy = "course")
    private Set<OrderDetail> orderDetails;

    @OneToMany(mappedBy = "course")
    private Set<CartItem> cartItems;

}

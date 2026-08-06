package com.example.khoahocdrive.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "authors")
public class Author extends AbstractEntity{

    @Column(name = "name")
    private String name;

    @Column(name = "description" ,nullable = false)
    private String description;

    @OneToMany(mappedBy = "author")
    private Set<Course> courses;
}

package com.example.khoahocdrive.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "socials")
public class Social extends AbstractEntity{

    @Column(name = "platform",unique = true)
    private String platform;

    @Column(name = "link")
    private String link;

    @Column(name = "description")
    private String description;
}

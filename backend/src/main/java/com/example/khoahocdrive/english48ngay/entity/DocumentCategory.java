package com.example.khoahocdrive.english48ngay.entity;

import com.example.khoahocdrive.models.AbstractEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dl_document_categories")
public class DocumentCategory extends AbstractEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "icon")
    @Builder.Default
    private String icon = "folder";

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DLDocument> documents;
}

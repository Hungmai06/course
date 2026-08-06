package com.example.khoahocdrive.english48ngay.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.khoahocdrive.models.AbstractEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dl_documents")
public class DLDocument extends AbstractEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    private DocumentCategory category;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "views")
    @Builder.Default
    private Integer views = 0;

    @Column(name = "download_url", columnDefinition = "TEXT")
    private String downloadUrl;
}

package com.example.khoahocdrive.dto.request;

import com.example.khoahocdrive.models.Author;
import com.example.khoahocdrive.models.Category;
import com.google.api.client.util.PemReader;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {
    private String name;
    private String description;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private String linkDrive;
    private String linkTest;
    private String authorName;
    private String categoryName;
    private String slug;
}

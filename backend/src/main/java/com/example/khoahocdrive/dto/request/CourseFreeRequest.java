package com.example.khoahocdrive.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseFreeRequest {
    private String title;
    private String category;
    private String description;
    private String link;
    private List<CourseFreeItem> items;
}

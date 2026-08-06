package com.example.khoahocdrive.dto.response;

import com.example.khoahocdrive.dto.request.CourseFreeItem;
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
public class CourseFreeResponse {
    private Long id;
    private String title;
    private String category;
    private String avatar;
    private String description;
    private String link;
    private List<CourseFreeItem> items;
    private Object structure;
    private Long views;
}

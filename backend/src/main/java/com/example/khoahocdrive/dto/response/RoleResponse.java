package com.example.khoahocdrive.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleResponse {
    private String name;
    private Long id;
    private String description;
}

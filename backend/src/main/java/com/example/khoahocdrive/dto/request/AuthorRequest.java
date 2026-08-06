package com.example.khoahocdrive.dto.request;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorRequest implements Serializable {

    private String name;

    private String description;

}

package com.example.khoahocdrive.dto.request;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmailOrder implements Serializable {
    private String email;
}

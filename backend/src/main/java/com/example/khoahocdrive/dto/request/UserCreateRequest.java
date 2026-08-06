package com.example.khoahocdrive.dto.request;

import com.example.khoahocdrive.supports.enums.VipEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest implements Serializable {
    private String email;

    private String password;

    private String username;

    private VipEnum vip;

}

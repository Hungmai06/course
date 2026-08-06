package com.example.khoahocdrive.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import com.example.khoahocdrive.supports.enums.VipEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest implements Serializable {
    private String email;
    private String username;
    private String password;
    private VipEnum vip;
}

package com.example.khoahocdrive.mapper;

import com.example.khoahocdrive.dto.response.RoleResponse;
import com.example.khoahocdrive.models.Role;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface RoleMapper {
    RoleResponse toResponse(Role role);
}

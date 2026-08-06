package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.RoleRequest;
import com.example.khoahocdrive.dto.response.RoleResponse;
import com.example.khoahocdrive.models.Role;

public interface RoleService {
    RoleResponse create(RoleRequest request);
}

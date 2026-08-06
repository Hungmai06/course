package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.RoleRequest;
import com.example.khoahocdrive.dto.response.RoleResponse;
import com.example.khoahocdrive.mapper.RoleMapper;
import com.example.khoahocdrive.models.Role;
import com.example.khoahocdrive.repository.RoleRepository;
import com.example.khoahocdrive.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    @Override
    public RoleResponse create(RoleRequest request) {
        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        roleRepository.save(role);
        return roleMapper.toResponse(role);
    }
}

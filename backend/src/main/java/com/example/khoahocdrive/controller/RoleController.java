package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.RoleRequest;
import com.example.khoahocdrive.dto.response.RoleResponse;
import com.example.khoahocdrive.models.Role;
import com.example.khoahocdrive.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/role")
@RequiredArgsConstructor
@Tag(name = "Role API")
public class RoleController {
    private final RoleService roleService;

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Create role")
    public ResponseEntity<RoleResponse> create(RoleRequest request){
        return ResponseEntity.ok(roleService.create(request));
    }
}

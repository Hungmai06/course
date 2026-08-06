package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.UserCreateRequest;
import com.example.khoahocdrive.dto.request.UserUpdateRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.dto.response.UserResponse;
import com.example.khoahocdrive.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@Tag(name = "User API")
public class UserController {
    private final UserService userService;
    @PostMapping(value = "/")
    @Operation(summary = "Create User")
    public ApiResponse<UserResponse> create( @RequestBody UserCreateRequest request) throws Exception {
        return userService.createUser(request);
    }

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Get All User")
    public ApiResponse<PagedResponse<UserResponse>> getAll(@RequestParam int page, @RequestParam int size){
        return userService.getAll(page,size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @Operation(summary = "Find User By Id")
    public ApiResponse<UserResponse>findUserById(@PathVariable Long id){
        return userService.findUserById(id);
    }

    @GetMapping("/s")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Search User ")
    public ApiResponse<PagedResponse<UserResponse>> findByCredential(@RequestParam String credential){
        return userService.findUserCredential(credential);
    }

    @PutMapping(value = "/{id}")
    @Operation(summary = "Update User")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) throws Exception {
        return userService.updateUser(id,request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete User By Id")
    public void delete(@PathVariable Long id){
        userService.deleteUser(id);
    }
}

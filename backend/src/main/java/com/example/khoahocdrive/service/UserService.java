package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.UserCreateRequest;
import com.example.khoahocdrive.dto.request.UserUpdateRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    ApiResponse<UserResponse> createUser(UserCreateRequest request) throws Exception;
    ApiResponse<PagedResponse<UserResponse>> getAll(int page,int Size) ;
    ApiResponse<UserResponse>updateUser(Long id, UserUpdateRequest request) throws Exception;
    ApiResponse<UserResponse>findUserById(Long id);
    ApiResponse<PagedResponse<UserResponse>> findUserCredential(String  credential);
    void deleteUser(Long id);
}

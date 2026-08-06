package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.SocialRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.models.Social;

import java.util.List;

public interface SocialService {
    ApiResponse<Social>  create(SocialRequest request);
    ApiResponse<List<Social>> getAll();
    ApiResponse<Social> update(Long id, SocialRequest request);
    void delete(Long id);
}

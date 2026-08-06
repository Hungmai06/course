package com.example.khoahocdrive.service;

import com.example.khoahocdrive.dto.request.AuthorRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.AuthorResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;

import java.util.List;

public interface AuthorService {

    ApiResponse<AuthorResponse> findAuthorById(Long id);

    ApiResponse<AuthorResponse> create(AuthorRequest request);

    ApiResponse<AuthorResponse> update(Long id, AuthorRequest request);

    ApiResponse<List<AuthorResponse>> getAll();

    void delete(Long id);
}

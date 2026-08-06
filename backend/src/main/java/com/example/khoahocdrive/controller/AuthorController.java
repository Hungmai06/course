package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.AuthorRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.AuthorResponse;
import com.example.khoahocdrive.service.AuthorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/author")
@RequiredArgsConstructor
@Tag(name = "Author API")
public class AuthorController {
    private final AuthorService authorService;
    @PostMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Create Author")
    public ApiResponse<AuthorResponse> create(@RequestBody AuthorRequest request){
        return authorService.create(request);
    }

    @GetMapping("/")
    @Operation(summary = "Get all Author")
    public  ApiResponse<List<AuthorResponse>> getAll(){
        return authorService.getAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Author By Id")
    public ApiResponse<AuthorResponse> findAuthorById(@PathVariable Long id){
        return authorService.findAuthorById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update Author")
    public ApiResponse<AuthorResponse> update(@PathVariable Long id, @RequestBody AuthorRequest request){
        return authorService.update(id,request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Delete Author")
    public void delete(@PathVariable Long id){
        authorService.delete(id);
    }
}

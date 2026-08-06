package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.SocialRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.models.Social;
import com.example.khoahocdrive.service.SocialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/v1/social")
@Tag(name = "Social API")
@RequiredArgsConstructor
public class SocialController {
    private final SocialService socialService;

    @GetMapping("/")
    @Operation(summary = "Get all Social")
    public ApiResponse<List<Social>> getAll(){
        return socialService.getAll();
    }
    @PostMapping("/")
    @Operation(summary = "Create Social")
    public ApiResponse<Social> create(@RequestBody SocialRequest request){
        return socialService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Social")
    public ApiResponse<Social> update(@PathVariable Long id,@RequestBody SocialRequest request){
        return socialService.update(id,request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Social")
    public void delete(@PathVariable Long id){
        socialService.delete(id);
    }
}

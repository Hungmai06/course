package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.SocialRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.models.Social;
import com.example.khoahocdrive.repository.SocialRepository;
import com.example.khoahocdrive.service.SocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SocialServiceImpl implements SocialService {
    private final SocialRepository socialRepository;
    @Override
    public ApiResponse<Social> create(SocialRequest request) {
        if(socialRepository.findByPlatform(request.getPlatform()).isPresent()){
             throw new InvalidDataException("Social existed");
        }
        Social social = Social.builder()
                .platform(request.getPlatform())
                .link(request.getLink())
                .description(request.getDescription())
                .build();
        socialRepository.save(social);
        return ApiResponse.<Social>builder()
                .message("create social successfully")
                .data(social)
                .build();
    }

    @Override
    public ApiResponse<List<Social>> getAll() {
        return ApiResponse.<List<Social>>builder()
                .message("Get all social")
                .data(socialRepository.findAll())
                .build();
    }

    @Override
    public ApiResponse<Social>  update(Long id,SocialRequest request) {
        Social social = socialRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("Social not found")
        );
        social.setLink(request.getLink());
        social.setPlatform(request.getPlatform());
        social.setDescription(request.getDescription());
        socialRepository.save(social);
        return ApiResponse.<Social>builder()
                .message("Update Social Successfully")
                .data(social)
                .build();
    }

    @Override
    public void delete(Long id) {
        socialRepository.deleteById(id);
    }
}

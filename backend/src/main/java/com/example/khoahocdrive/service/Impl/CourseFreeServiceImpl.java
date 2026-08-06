package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.CourseFreeItem;
import com.example.khoahocdrive.dto.request.CourseFreeRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CourseFreeResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.models.CourseFree;
import com.example.khoahocdrive.repository.CourseFreeRepository;
import com.example.khoahocdrive.service.CloudinaryService;
import com.example.khoahocdrive.service.CourseFreeService;
import com.example.khoahocdrive.supports.utils.CloudinaryUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseFreeServiceImpl implements CourseFreeService {

    private final CourseFreeRepository courseFreeRepository;
    private final CloudinaryService cloudinaryService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private JsonNode parseJsonTree(String text) {
        if (text == null || text.isBlank()) return null;
        String clean = text.trim();
        // Clean markdown fenced code blocks ```json ... ```
        if (clean.startsWith("```")) {
            clean = clean.replaceAll("^```[a-zA-Z]*", "").replaceAll("```$", "").trim();
        }
        int firstBrace = clean.indexOf("{");
        int lastBrace = clean.lastIndexOf("}");
        if (firstBrace != -1 && lastBrace > firstBrace) {
            String jsonSub = clean.substring(firstBrace, lastBrace + 1);
            try {
                return objectMapper.readTree(jsonSub);
            } catch (Exception ignored) {}
        }
        return null;
    }

    private CourseFreeResponse toResponse(CourseFree entity) {
        if (entity == null) return null;

        List<CourseFreeItem> itemsList = new ArrayList<>();
        Object structureTree = null;

        // Try parsing itemsJson first
        if (entity.getItemsJson() != null && !entity.getItemsJson().isBlank()) {
            String jsonStr = entity.getItemsJson().trim();
            structureTree = parseJsonTree(jsonStr);
            if (structureTree == null && jsonStr.startsWith("[")) {
                try {
                    itemsList = objectMapper.readValue(jsonStr, new TypeReference<List<CourseFreeItem>>() {});
                } catch (Exception ignored) {}
            }
        }

        // Try parsing description if structureTree not found yet
        if (structureTree == null && entity.getDescription() != null && !entity.getDescription().isBlank()) {
            structureTree = parseJsonTree(entity.getDescription());
        }

        // Fallback: If itemsList is empty and structure is null, build from main link if available
        if (itemsList.isEmpty() && structureTree == null && entity.getLink() != null && !entity.getLink().isBlank()) {
            itemsList.add(CourseFreeItem.builder()
                    .title("Tài liệu & Bài giảng chính")
                    .link(entity.getLink())
                    .build());
        }

        return CourseFreeResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .category(entity.getCategory() != null && !entity.getCategory().isBlank() ? entity.getCategory() : "Khác")
                .avatar(CloudinaryUtils.optimize(entity.getAvatar()))
                .description(entity.getDescription())
                .link(entity.getLink())
                .items(itemsList)
                .structure(structureTree)
                .views(entity.getViews() != null ? entity.getViews() : 0L)
                .build();
    }

    private String serializeItems(List<CourseFreeItem> items) {
        if (items == null || items.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public ApiResponse<List<CourseFreeResponse>> getAllFreeCourses() {
        List<CourseFree> list = courseFreeRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        List<CourseFreeResponse> responseList = list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<CourseFreeResponse>>builder()
                .code(200)
                .message("Get all free courses successfully")
                .data(responseList)
                .build();
    }

    @Override
    public ApiResponse<PagedResponse<CourseFreeResponse>> getAllFreeCoursesPaged(int page, int size, String description, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<CourseFree> pageResult;

        boolean hasQuery = description != null && !description.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty() && !"Tất cả".equalsIgnoreCase(category.trim());

        if (hasCategory) {
            pageResult = courseFreeRepository.findByCategory(category.trim(), pageable);
        } else if (hasQuery) {
            String query = description.trim();
            pageResult = courseFreeRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query, pageable);
        } else {
            pageResult = courseFreeRepository.findAll(pageable);
        }

        Page<CourseFreeResponse> responsePage = pageResult.map(this::toResponse);

        PagedResponse<CourseFreeResponse> pagedResponse = PagedResponse.<CourseFreeResponse>builder()
                .content(responsePage.getContent())
                .pageNumber(responsePage.getNumber())
                .pageSize(responsePage.getSize())
                .totalElements(responsePage.getTotalElements())
                .totalPages(responsePage.getTotalPages())
                .build();

        return ApiResponse.<PagedResponse<CourseFreeResponse>>builder()
                .code(200)
                .message("Get free courses list successfully")
                .data(pagedResponse)
                .build();
    }

    @Override
    public ApiResponse<CourseFreeResponse> getFreeCourseById(Long id) {
        CourseFree entity = courseFreeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course free not found with id: " + id));

        return ApiResponse.<CourseFreeResponse>builder()
                .code(200)
                .message("Get free course detail successfully")
                .data(toResponse(entity))
                .build();
    }

    @Override
    public ApiResponse<CourseFreeResponse> createFreeCourse(MultipartFile file, CourseFreeRequest request) throws Exception {
        String avatarUrl = null;
        if (file != null && !file.isEmpty()) {
            avatarUrl = cloudinaryService.uploadImage(file);
        }

        CourseFree entity = CourseFree.builder()
                .title(request.getTitle())
                .category(request.getCategory() != null ? request.getCategory().trim() : "Ngoại ngữ")
                .description(request.getDescription())
                .link(request.getLink())
                .itemsJson(serializeItems(request.getItems()))
                .avatar(avatarUrl)
                .build();

        CourseFree saved = courseFreeRepository.save(entity);

        return ApiResponse.<CourseFreeResponse>builder()
                .code(201)
                .message("Created free course successfully")
                .data(toResponse(saved))
                .build();
    }

    @Override
    public ApiResponse<CourseFreeResponse> updateFreeCourse(Long id, MultipartFile file, CourseFreeRequest request) throws Exception {
        CourseFree entity = courseFreeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course free not found with id: " + id));

        entity.setTitle(request.getTitle());
        if (request.getCategory() != null) {
            entity.setCategory(request.getCategory().trim());
        }
        entity.setDescription(request.getDescription());
        entity.setLink(request.getLink());
        entity.setItemsJson(serializeItems(request.getItems()));

        if (file != null && !file.isEmpty()) {
            String newAvatarUrl = cloudinaryService.uploadImage(file);
            entity.setAvatar(newAvatarUrl);
        }

        CourseFree updated = courseFreeRepository.save(entity);

        return ApiResponse.<CourseFreeResponse>builder()
                .code(200)
                .message("Updated free course successfully")
                .data(toResponse(updated))
                .build();
    }

    @Override
    public ApiResponse<CourseFreeResponse> incrementViewCount(Long id) {
        CourseFree entity = courseFreeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course free not found with id: " + id));

        Long currentViews = entity.getViews() != null ? entity.getViews() : 0L;
        entity.setViews(currentViews + 1L);
        CourseFree saved = courseFreeRepository.save(entity);

        return ApiResponse.<CourseFreeResponse>builder()
                .code(200)
                .message("Increment view count successfully")
                .data(toResponse(saved))
                .build();
    }

    @Override
    public void deleteFreeCourse(Long id) {
        CourseFree entity = courseFreeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course free not found with id: " + id));
        courseFreeRepository.delete(entity);
    }
}

package com.example.khoahocdrive.english48ngay.controller;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.english48ngay.dto.*;
import com.example.khoahocdrive.english48ngay.service.DolphinLearnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/english")
@RequiredArgsConstructor
@Tag(name = "DolphinLearn API", description = "Endpoints for DolphinLearn Application")
public class DolphinLearnController {

    private final DolphinLearnService dlService;

    // ==========================================
    // Users
    // ==========================================
    @GetMapping("/users")
    @Operation(summary = "Get paginated users (Admin)")
    public ApiResponse<com.example.khoahocdrive.dto.response.PagedResponse<DLUserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        return ApiResponse.<com.example.khoahocdrive.dto.response.PagedResponse<DLUserResponse>>builder()
                .code(200)
                .message("Fetched users successfully")
                .data(dlService.getAllUsers(page, size, search))
                .build();
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID")
    public ApiResponse<DLUserResponse> getUserById(@PathVariable Long id) {
        return ApiResponse.<DLUserResponse>builder()
                .code(200)
                .message("Fetched user successfully")
                .data(dlService.getUserById(id))
                .build();
    }

    @PostMapping("/users")
    @Operation(summary = "Create user (Admin)")
    public ApiResponse<DLUserResponse> createUser(@RequestBody DLUserRequest request) {
        return ApiResponse.<DLUserResponse>builder()
                .code(201)
                .message("User created successfully")
                .data(dlService.createUser(request))
                .build();
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user (Admin)")
    public ApiResponse<DLUserResponse> updateUser(@PathVariable Long id, @RequestBody DLUserRequest request) {
        return ApiResponse.<DLUserResponse>builder()
                .code(200)
                .message("User updated successfully")
                .data(dlService.updateUser(id, request))
                .build();
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user (Admin)")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        dlService.deleteUser(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("User deleted successfully")
                .build();
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Get top users for leaderboard")
    public ApiResponse<List<DLUserResponse>> getLeaderboard() {
        return ApiResponse.<List<DLUserResponse>>builder()
                .code(200)
                .message("Fetched leaderboard successfully")
                .data(dlService.getLeaderboard())
                .build();
    }

    // ==========================================
    // Vocabulary Level 1: Collections
    // ==========================================
    @GetMapping("/vocabulary/collections")
    @Operation(summary = "Get all vocabulary collections")
    public ApiResponse<List<VocabularyCollectionResponse>> getAllCollections() {
        return ApiResponse.<List<VocabularyCollectionResponse>>builder()
                .code(200)
                .message("Fetched all collections successfully")
                .data(dlService.getAllCollections())
                .build();
    }

    @GetMapping("/vocabulary/collections/{id}")
    @Operation(summary = "Get a collection by ID")
    public ApiResponse<VocabularyCollectionResponse> getCollectionById(@PathVariable Long id) {
        return ApiResponse.<VocabularyCollectionResponse>builder()
                .code(200)
                .message("Fetched collection successfully")
                .data(dlService.getCollectionById(id))
                .build();
    }

    @PostMapping("/vocabulary/collections")
    @Operation(summary = "Create collection (Admin)")
    public ApiResponse<VocabularyCollectionResponse> createCollection(@RequestBody VocabularyCollectionRequest request) {
        return ApiResponse.<VocabularyCollectionResponse>builder()
                .code(201)
                .message("Collection created successfully")
                .data(dlService.createCollection(request))
                .build();
    }

    @PutMapping("/vocabulary/collections/{id}")
    @Operation(summary = "Update collection (Admin)")
    public ApiResponse<VocabularyCollectionResponse> updateCollection(@PathVariable Long id, @RequestBody VocabularyCollectionRequest request) {
        return ApiResponse.<VocabularyCollectionResponse>builder()
                .code(200)
                .message("Collection updated successfully")
                .data(dlService.updateCollection(id, request))
                .build();
    }

    @DeleteMapping("/vocabulary/collections/{id}")
    @Operation(summary = "Delete collection (Admin)")
    public ApiResponse<Void> deleteCollection(@PathVariable Long id) {
        dlService.deleteCollection(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Collection deleted successfully")
                .build();
    }

    // ==========================================
    // Vocabulary Level 2: Topics
    // ==========================================
    @GetMapping("/vocabulary/topics")
    @Operation(summary = "Get all topics")
    public ApiResponse<List<VocabularyTopicResponse>> getAllTopics() {
        return ApiResponse.<List<VocabularyTopicResponse>>builder()
                .code(200)
                .message("Fetched all topics successfully")
                .data(dlService.getAllTopics())
                .build();
    }

    @GetMapping("/vocabulary/collections/{id}/topics")
    @Operation(summary = "Get topics by collection ID")
    public ApiResponse<List<VocabularyTopicResponse>> getTopicsByCollection(@PathVariable Long id) {
        return ApiResponse.<List<VocabularyTopicResponse>>builder()
                .code(200)
                .message("Fetched topics successfully")
                .data(dlService.getTopicsByCollection(id))
                .build();
    }

    @GetMapping("/vocabulary/topics/{id}")
    @Operation(summary = "Get topic by ID")
    public ApiResponse<VocabularyTopicResponse> getTopicById(@PathVariable Long id) {
        return ApiResponse.<VocabularyTopicResponse>builder()
                .code(200)
                .message("Fetched topic successfully")
                .data(dlService.getTopicById(id))
                .build();
    }

    @PostMapping("/vocabulary/topics")
    @Operation(summary = "Create standalone topic (Admin)")
    public ApiResponse<VocabularyTopicResponse> createStandaloneTopic(@RequestBody VocabularyTopicRequest request) {
        return ApiResponse.<VocabularyTopicResponse>builder()
                .code(201)
                .message("Topic created successfully")
                .data(dlService.createTopic(request, request.getCollectionId()))
                .build();
    }

    @PostMapping("/vocabulary/collections/{id}/topics")
    @Operation(summary = "Create topic under collection (Admin)")
    public ApiResponse<VocabularyTopicResponse> createTopic(@PathVariable Long id, @RequestBody VocabularyTopicRequest request) {
        return ApiResponse.<VocabularyTopicResponse>builder()
                .code(201)
                .message("Topic created successfully")
                .data(dlService.createTopic(request, id))
                .build();
    }

    @PutMapping("/vocabulary/topics/{id}")
    @Operation(summary = "Update topic (Admin)")
    public ApiResponse<VocabularyTopicResponse> updateTopic(@PathVariable Long id, @RequestBody VocabularyTopicRequest request) {
        return ApiResponse.<VocabularyTopicResponse>builder()
                .code(200)
                .message("Topic updated successfully")
                .data(dlService.updateTopic(id, request))
                .build();
    }

    @DeleteMapping("/vocabulary/topics/{id}")
    @Operation(summary = "Delete topic (Admin)")
    public ApiResponse<Void> deleteTopic(@PathVariable Long id) {
        dlService.deleteTopic(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Topic deleted successfully")
                .build();
    }

    // ==========================================
    // Vocabulary Level 3: Subtopics
    // ==========================================
    @GetMapping("/vocabulary/subtopics")
    @Operation(summary = "Get all subtopics")
    public ApiResponse<List<VocabularySubtopicResponse>> getAllSubtopics() {
        return ApiResponse.<List<VocabularySubtopicResponse>>builder()
                .code(200)
                .message("Fetched all subtopics successfully")
                .data(dlService.getAllSubtopics())
                .build();
    }

    @GetMapping("/vocabulary/topics/{id}/subtopics")
    @Operation(summary = "Get subtopics by topic ID")
    public ApiResponse<List<VocabularySubtopicResponse>> getSubtopicsByTopic(@PathVariable Long id) {
        return ApiResponse.<List<VocabularySubtopicResponse>>builder()
                .code(200)
                .message("Fetched subtopics successfully")
                .data(dlService.getSubtopicsByTopic(id))
                .build();
    }

    @GetMapping("/vocabulary/subtopics/{id}")
    @Operation(summary = "Get subtopic by ID")
    public ApiResponse<VocabularySubtopicResponse> getSubtopicById(@PathVariable Long id) {
        return ApiResponse.<VocabularySubtopicResponse>builder()
                .code(200)
                .message("Fetched subtopic successfully")
                .data(dlService.getSubtopicById(id))
                .build();
    }

    @PostMapping("/vocabulary/topics/{id}/subtopics")
    @Operation(summary = "Create subtopic under topic (Admin)")
    public ApiResponse<VocabularySubtopicResponse> createSubtopic(@PathVariable Long id, @RequestBody VocabularySubtopicRequest request) {
        return ApiResponse.<VocabularySubtopicResponse>builder()
                .code(201)
                .message("Subtopic created successfully")
                .data(dlService.createSubtopic(request, id))
                .build();
    }

    @PutMapping("/vocabulary/subtopics/{id}")
    @Operation(summary = "Update subtopic (Admin)")
    public ApiResponse<VocabularySubtopicResponse> updateSubtopic(@PathVariable Long id, @RequestBody VocabularySubtopicRequest request) {
        return ApiResponse.<VocabularySubtopicResponse>builder()
                .code(200)
                .message("Subtopic updated successfully")
                .data(dlService.updateSubtopic(id, request))
                .build();
    }

    @DeleteMapping("/vocabulary/subtopics/{id}")
    @Operation(summary = "Delete subtopic (Admin)")
    public ApiResponse<Void> deleteSubtopic(@PathVariable Long id) {
        dlService.deleteSubtopic(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Subtopic deleted successfully")
                .build();
    }

    // Deprecated compatibility endpoints for subcollections mapping to subtopics
    @GetMapping("/vocabulary/collections/{id}/subs")
    @Operation(summary = "Get subtopics as subs for backward compatibility")
    public ApiResponse<List<VocabularyTopicResponse>> getSubCollectionsByCollection(@PathVariable Long id) {
        return ApiResponse.<List<VocabularyTopicResponse>>builder()
                .code(200)
                .message("Fetched topics successfully")
                .data(dlService.getTopicsByCollection(id))
                .build();
    }

    @PostMapping("/vocabulary/collections/{collectionId}/subs")
    @Operation(summary = "Create subcollection mapping to subtopic for backward compatibility")
    public ApiResponse<VocabularySubtopicResponse> createSubCollectionCompat(
            @PathVariable Long collectionId,
            @RequestBody VocabularySubtopicRequest request) {
        return ApiResponse.<VocabularySubtopicResponse>builder()
                .code(201)
                .message("Subcollection created successfully")
                .data(dlService.createSubtopicCompat(collectionId, request))
                .build();
    }

    @PutMapping("/vocabulary/subs/{id}")
    @Operation(summary = "Update subcollection mapping to subtopic for backward compatibility")
    public ApiResponse<VocabularySubtopicResponse> updateSubCollectionCompat(
            @PathVariable Long id,
            @RequestBody VocabularySubtopicRequest request) {
        return ApiResponse.<VocabularySubtopicResponse>builder()
                .code(200)
                .message("Subcollection updated successfully")
                .data(dlService.updateSubtopic(id, request))
                .build();
    }

    @DeleteMapping("/vocabulary/subs/{id}")
    @Operation(summary = "Delete subcollection mapping to subtopic for backward compatibility")
    public ApiResponse<Void> deleteSubCollectionCompat(@PathVariable Long id) {
        dlService.deleteSubtopic(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Subcollection deleted successfully")
                .build();
    }

    // ==========================================
    // Vocabulary Level 4: Words
    // ==========================================
    @GetMapping("/vocabulary/words")
    @Operation(summary = "Get paginated vocabulary words")
    public ApiResponse<com.example.khoahocdrive.dto.response.PagedResponse<DLVocabularyWordResponse>> getAllWords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long subtopicId,
            @RequestParam(required = false) Long subCollectionId) {
        Long targetSubtopicId = subtopicId != null ? subtopicId : subCollectionId;
        return ApiResponse.<com.example.khoahocdrive.dto.response.PagedResponse<DLVocabularyWordResponse>>builder()
                .code(200)
                .message("Fetched paginated words successfully")
                .data(dlService.getAllWords(page, size, search, targetSubtopicId))
                .build();
    }

    @GetMapping("/vocabulary/subtopics/{subId}/words")
    @Operation(summary = "Get words by subtopic ID")
    public ApiResponse<List<DLVocabularyWordResponse>> getWordsBySubtopic(@PathVariable Long subId) {
        return ApiResponse.<List<DLVocabularyWordResponse>>builder()
                .code(200)
                .message("Fetched words successfully")
                .data(dlService.getWordsBySubtopic(subId))
                .build();
    }

    @GetMapping("/vocabulary/subs/{subId}/words")
    @Operation(summary = "Get words by subtopic ID (compatibility)")
    public ApiResponse<List<DLVocabularyWordResponse>> getWordsBySubCollection(@PathVariable Long subId) {
        return ApiResponse.<List<DLVocabularyWordResponse>>builder()
                .code(200)
                .message("Fetched words successfully")
                .data(dlService.getWordsBySubtopic(subId))
                .build();
    }

    @PostMapping("/vocabulary/subtopics/{subId}/words")
    @Operation(summary = "Create vocabulary word under subtopic (Admin)")
    public ApiResponse<DLVocabularyWordResponse> createWord(@PathVariable Long subId, @RequestBody DLVocabularyWordRequest request) {
        return ApiResponse.<DLVocabularyWordResponse>builder()
                .code(201)
                .message("Word created successfully")
                .data(dlService.createWord(request, subId))
                .build();
    }

    @PostMapping("/vocabulary/subtopics/{subId}/words/bulk")
    @Operation(summary = "Bulk import vocabulary words under subtopic (Admin)")
    public ApiResponse<List<DLVocabularyWordResponse>> bulkCreateWords(@PathVariable Long subId, @RequestBody List<DLVocabularyWordRequest> requests) {
        return ApiResponse.<List<DLVocabularyWordResponse>>builder()
                .code(201)
                .message("Bulk import completed")
                .data(dlService.bulkCreateWords(requests, subId))
                .build();
    }

    // Compat: /subs/{subId}/words -> subtopic endpoint
    @PostMapping("/vocabulary/subs/{subId}/words")
    @Operation(summary = "Create vocabulary word (compat endpoint)")
    public ApiResponse<DLVocabularyWordResponse> createWordCompat(@PathVariable Long subId, @RequestBody DLVocabularyWordRequest request) {
        return ApiResponse.<DLVocabularyWordResponse>builder()
                .code(201)
                .message("Word created successfully")
                .data(dlService.createWord(request, subId))
                .build();
    }

    @PutMapping("/vocabulary/words/{id}")
    @Operation(summary = "Update vocabulary word (Admin)")
    public ApiResponse<DLVocabularyWordResponse> updateWord(@PathVariable Long id, @RequestBody DLVocabularyWordRequest request) {
        return ApiResponse.<DLVocabularyWordResponse>builder()
                .code(200)
                .message("Word updated successfully")
                .data(dlService.updateWord(id, request))
                .build();
    }

    @DeleteMapping("/vocabulary/words/{id}")
    @Operation(summary = "Delete vocabulary word (Admin)")
    public ApiResponse<Void> deleteWord(@PathVariable Long id) {
        dlService.deleteWord(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Word deleted successfully")
                .build();
    }

    // ==========================================
    // User Progress
    // ==========================================
    @GetMapping("/vocabulary/progress")
    @Operation(summary = "Get user vocabulary progress")
    public ApiResponse<Object> getProgress(@RequestParam String username,
                                            @RequestParam(required = false) Long subtopicId,
                                            @RequestParam(required = false) Long subCollectionId) {
        Long targetSubtopicId = subtopicId != null ? subtopicId : subCollectionId;
        if (targetSubtopicId != null) {
            return ApiResponse.<Object>builder()
                    .code(200)
                    .message("Fetched user progress successfully")
                    .data(dlService.getProgress(username, targetSubtopicId))
                    .build();
        } else {
            return ApiResponse.<Object>builder()
                    .code(200)
                    .message("Fetched all progress successfully")
                    .data(dlService.getAllProgress(username))
                    .build();
        }
    }

    @PostMapping("/vocabulary/progress")
    @Operation(summary = "Update user vocabulary progress")
    public ApiResponse<UserVocabularyProgressResponse> updateProgress(@RequestParam String username,
                                                                        @RequestParam(required = false) Long subtopicId,
                                                                        @RequestParam(required = false) Long subCollectionId,
                                                                        @RequestParam(required = false, defaultValue = "") String mode,
                                                                        @RequestBody List<Long> learnedWordIds) {
        Long targetSubtopicId = subtopicId != null ? subtopicId : subCollectionId;
        return ApiResponse.<UserVocabularyProgressResponse>builder()
                .code(200)
                .message("Updated progress successfully")
                .data(dlService.updateProgress(username, targetSubtopicId, learnedWordIds, mode))
                .build();
    }

    // ==========================================
    // Document Categories
    // ==========================================
    @GetMapping("/documents/categories")
    @Operation(summary = "Get all document categories")
    public ApiResponse<List<DocumentCategoryResponse>> getAllDocumentCategories() {
        return ApiResponse.<List<DocumentCategoryResponse>>builder()
                .code(200)
                .message("Fetched categories successfully")
                .data(dlService.getAllDocumentCategories())
                .build();
    }

    @GetMapping("/documents/categories/{id}")
    @Operation(summary = "Get category by ID")
    public ApiResponse<DocumentCategoryResponse> getDocumentCategoryById(@PathVariable Long id) {
        return ApiResponse.<DocumentCategoryResponse>builder()
                .code(200)
                .message("Fetched category successfully")
                .data(dlService.getDocumentCategoryById(id))
                .build();
    }

    @PostMapping("/documents/categories")
    @Operation(summary = "Create document category (Admin)")
    public ApiResponse<DocumentCategoryResponse> createDocumentCategory(@RequestBody DocumentCategoryRequest request) {
        return ApiResponse.<DocumentCategoryResponse>builder()
                .code(201)
                .message("Category created successfully")
                .data(dlService.createDocumentCategory(request))
                .build();
    }

    @PutMapping("/documents/categories/{id}")
    @Operation(summary = "Update document category (Admin)")
    public ApiResponse<DocumentCategoryResponse> updateDocumentCategory(@PathVariable Long id, @RequestBody DocumentCategoryRequest request) {
        return ApiResponse.<DocumentCategoryResponse>builder()
                .code(200)
                .message("Category updated successfully")
                .data(dlService.updateDocumentCategory(id, request))
                .build();
    }

    @DeleteMapping("/documents/categories/{id}")
    @Operation(summary = "Delete document category (Admin)")
    public ApiResponse<Void> deleteDocumentCategory(@PathVariable Long id) {
        dlService.deleteDocumentCategory(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Category deleted successfully")
                .build();
    }

    // ==========================================
    // Documents
    // ==========================================
    @GetMapping("/documents")
    @Operation(summary = "Get paginated documents")
    public ApiResponse<com.example.khoahocdrive.dto.response.PagedResponse<DLDocumentResponse>> getAllDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId) {
        return ApiResponse.<com.example.khoahocdrive.dto.response.PagedResponse<DLDocumentResponse>>builder()
                .code(200)
                .message("Fetched paginated documents successfully")
                .data(dlService.getAllDocuments(page, size, search, categoryId))
                .build();
    }

    @GetMapping("/documents/{id}")
    @Operation(summary = "Get document by ID")
    public ApiResponse<DLDocumentResponse> getDocumentById(@PathVariable Long id) {
        return ApiResponse.<DLDocumentResponse>builder()
                .code(200)
                .message("Fetched document successfully")
                .data(dlService.getDocumentById(id))
                .build();
    }

    @PostMapping("/documents/categories/{categoryId}")
    @Operation(summary = "Create document in category (Admin)")
    public ApiResponse<DLDocumentResponse> createDocument(@PathVariable Long categoryId, @RequestBody DLDocumentRequest request) {
        return ApiResponse.<DLDocumentResponse>builder()
                .code(201)
                .message("Document created successfully")
                .data(dlService.createDocument(request, categoryId))
                .build();
    }

    @PostMapping("/documents")
    @Operation(summary = "Create document (Admin)")
    public ApiResponse<DLDocumentResponse> createDocumentWithParam(@RequestParam(required = false) Long categoryId, @RequestBody DLDocumentRequest request) {
        return ApiResponse.<DLDocumentResponse>builder()
                .code(201)
                .message("Document created successfully")
                .data(dlService.createDocument(request, categoryId))
                .build();
    }

    @PutMapping("/documents/{id}")
    @Operation(summary = "Update document (Admin)")
    public ApiResponse<DLDocumentResponse> updateDocument(@PathVariable Long id, 
                                                            @RequestParam(required = false) Long categoryId, 
                                                            @RequestBody DLDocumentRequest request) {
        return ApiResponse.<DLDocumentResponse>builder()
                .code(200)
                .message("Document updated successfully")
                .data(dlService.updateDocument(id, request, categoryId))
                .build();
    }

    @DeleteMapping("/documents/{id}")
    @Operation(summary = "Delete document (Admin)")
    public ApiResponse<Void> deleteDocument(@PathVariable Long id) {
        dlService.deleteDocument(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Document deleted successfully")
                .build();
    }

    @PostMapping("/documents/{id}/view")
    @Operation(summary = "Increment document views counter")
    public ApiResponse<DLDocumentResponse> incrementViews(@PathVariable Long id) {
        return ApiResponse.<DLDocumentResponse>builder()
                .code(200)
                .message("Document views incremented")
                .data(dlService.incrementViews(id))
                .build();
    }

    // ==========================================
    // Auth & Utilities
    // ==========================================
    @PostMapping("/auth/login")
    @Operation(summary = "Login DolphinLearn account")
    public ApiResponse<DLUserResponse> login(@RequestBody DLLoginRequest request) {
        return ApiResponse.<DLUserResponse>builder()
                .code(200)
                .message("Login successful")
                .data(dlService.login(request.getEmail(), request.getPassword()))
                .build();
    }

    @PostMapping("/auth/register")
    @Operation(summary = "Register new DolphinLearn account")
    public ApiResponse<DLUserResponse> register(@RequestBody DLRegisterRequest request) {
        return ApiResponse.<DLUserResponse>builder()
                .code(201)
                .message("Registration successful")
                .data(dlService.register(request.getName(), request.getEmail(), request.getPassword()))
                .build();
    }

    @GetMapping("/admin/statistics")
    @Operation(summary = "Get admin dashboard overview statistics")
    public ApiResponse<DLAdminStatisticsResponse> getAdminStatistics() {
        return ApiResponse.<DLAdminStatisticsResponse>builder()
                .code(200)
                .message("Fetched admin statistics successfully")
                .data(dlService.getAdminStatistics())
                .build();
    }

    @PostMapping("/visit")
    @Operation(summary = "Record system visit")
    public ApiResponse<Void> recordVisit() {
        dlService.recordVisit();
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Visit recorded successfully")
                .build();
    }

    @GetMapping({"/chat", "/chat/messages"})
    @Operation(summary = "Get global chat messages")
    public ApiResponse<List<DLChatMessageResponse>> getChatMessages() {
        return ApiResponse.<List<DLChatMessageResponse>>builder()
                .code(200)
                .message("Fetched chat messages successfully")
                .data(dlService.getChatMessages())
                .build();
    }

    @PostMapping({"/chat", "/chat/messages"})
    @Operation(summary = "Send global chat message")
    public ApiResponse<DLChatMessageResponse> saveChatMessage(
            @RequestParam(required = false) String senderEmail,
            @RequestParam(required = false) String email,
            @RequestBody DLChatMessageRequest request) {
        String finalEmail = senderEmail != null ? senderEmail : email;
        return ApiResponse.<DLChatMessageResponse>builder()
                .code(201)
                .message("Chat message sent successfully")
                .data(dlService.saveChatMessage(finalEmail, request))
                .build();
    }
}

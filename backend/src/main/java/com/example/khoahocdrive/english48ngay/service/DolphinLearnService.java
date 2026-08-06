package com.example.khoahocdrive.english48ngay.service;

import com.example.khoahocdrive.english48ngay.dto.*;
import com.example.khoahocdrive.dto.response.PagedResponse;

import java.util.List;

public interface DolphinLearnService {

    // Users (Leaderboard / Admin CRUD)
    List<DLUserResponse> getAllUsers();
    DLUserResponse getUserById(Long id);
    DLUserResponse createUser(DLUserRequest request);
    DLUserResponse updateUser(Long id, DLUserRequest request);
    void deleteUser(Long id);
    List<DLUserResponse> getLeaderboard();

    // Vocabulary Level 1: Collections
    List<VocabularyCollectionResponse> getAllCollections();
    VocabularyCollectionResponse getCollectionById(Long id);
    VocabularyCollectionResponse createCollection(VocabularyCollectionRequest request);
    VocabularyCollectionResponse updateCollection(Long id, VocabularyCollectionRequest request);
    void deleteCollection(Long id);

    // Vocabulary Level 2: Topics
    List<VocabularyTopicResponse> getAllTopics();
    List<VocabularyTopicResponse> getTopicsByCollection(Long collectionId);
    VocabularyTopicResponse getTopicById(Long id);
    VocabularyTopicResponse createTopic(VocabularyTopicRequest request, Long collectionId);
    VocabularyTopicResponse updateTopic(Long id, VocabularyTopicRequest request);
    void deleteTopic(Long id);

    // Vocabulary Level 3: Subtopics
    List<VocabularySubtopicResponse> getAllSubtopics();
    List<VocabularySubtopicResponse> getSubtopicsByTopic(Long topicId);
    VocabularySubtopicResponse getSubtopicById(Long id);
    VocabularySubtopicResponse createSubtopic(VocabularySubtopicRequest request, Long topicId);
    VocabularySubtopicResponse createSubtopicCompat(Long collectionId, VocabularySubtopicRequest request);
    VocabularySubtopicResponse updateSubtopic(Long id, VocabularySubtopicRequest request);
    void deleteSubtopic(Long id);

    // Vocabulary Level 4: Words
    List<DLVocabularyWordResponse> getWordsBySubtopic(Long subtopicId);
    DLVocabularyWordResponse getWordById(Long id);
    DLVocabularyWordResponse createWord(DLVocabularyWordRequest request, Long subtopicId);
    List<DLVocabularyWordResponse> bulkCreateWords(List<DLVocabularyWordRequest> requests, Long subtopicId);
    DLVocabularyWordResponse updateWord(Long id, DLVocabularyWordRequest request);
    void deleteWord(Long id);

    // User Progress
    List<UserVocabularyProgressResponse> getAllProgress(String username);
    UserVocabularyProgressResponse getProgress(String username, Long subtopicId);
    UserVocabularyProgressResponse updateProgress(String username, Long subtopicId, List<Long> learnedWordIds, String mode);

    // Document Categories
    List<DocumentCategoryResponse> getAllDocumentCategories();
    DocumentCategoryResponse getDocumentCategoryById(Long id);
    DocumentCategoryResponse createDocumentCategory(DocumentCategoryRequest request);
    DocumentCategoryResponse updateDocumentCategory(Long id, DocumentCategoryRequest request);
    void deleteDocumentCategory(Long id);

    // Documents
    List<DLDocumentResponse> getAllDocuments(Long categoryId);
    DLDocumentResponse getDocumentById(Long id);
    DLDocumentResponse createDocument(DLDocumentRequest request, Long categoryId);
    DLDocumentResponse updateDocument(Long id, DLDocumentRequest request, Long categoryId);
    void deleteDocument(Long id);
    DLDocumentResponse incrementViews(Long id);

    // Authentication
    DLUserResponse login(String email, String password);
    DLUserResponse register(String name, String email, String password);

    // Statistics
    DLAdminStatisticsResponse getAdminStatistics();
    void recordVisit();

    // Chat Messages
    List<DLChatMessageResponse> getChatMessages();
    DLChatMessageResponse saveChatMessage(String senderEmail, DLChatMessageRequest request);

    // Paginated queries
    PagedResponse<DLUserResponse> getAllUsers(int page, int size, String search);
    PagedResponse<DLVocabularyWordResponse> getAllWords(int page, int size, String search, Long subtopicId);
    PagedResponse<DLDocumentResponse> getAllDocuments(int page, int size, String search, Long categoryId);
}

package com.example.khoahocdrive.english48ngay.service;

import com.example.khoahocdrive.english48ngay.dto.*;
import com.example.khoahocdrive.english48ngay.entity.*;
import com.example.khoahocdrive.english48ngay.repository.*;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.supports.utils.CloudinaryUtils;
import com.example.khoahocdrive.supports.utils.PasswordUtil;
import com.example.khoahocdrive.dto.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DolphinLearnServiceImpl implements DolphinLearnService {

    private final DLUserRepository dlUserRepository;
    private final PasswordUtil passwordUtil;

    private final VocabularyCollectionRepository collectionRepo;
    private final VocabularyTopicRepository topicRepo;
    private final VocabularySubtopicRepository subtopicRepo;
    private final DLVocabularyWordRepository wordRepo;
    private final UserVocabularyProgressRepository progressRepo;
    private final DocumentCategoryRepository docCatRepo;
    private final DLDocumentRepository docRepo;
    private final DLChatMessageRepository chatMessageRepo;
    private final DLVisitorRepository visitorRepo;

    // ==========================================
    // Converters: Entity -> Response DTO
    // ==========================================

    private DLUserResponse toUserResponse(DLUser user) {
        return DLUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(CloudinaryUtils.optimize(user.getAvatarUrl()))
                .points(user.getPoints())
                .streak(user.getStreak())
                .role(user.getRole())
                .lastActive(user.getLastActive())
                .build();
    }

    private VocabularyCollectionResponse toCollectionResponse(VocabularyCollection col) {
        List<VocabularyTopicResponse> topicResponses = null;
        if (col.getTopics() != null) {
            topicResponses = col.getTopics().stream()
                    .map(this::toTopicResponse)
                    .collect(Collectors.toList());
        }
        long wordCount = wordRepo.countBySubtopicTopicCollectionId(col.getId());
        return VocabularyCollectionResponse.builder()
                .id(col.getId())
                .title(col.getTitle())
                .description(col.getDescription())
                .icon(col.getIcon())
                .color(col.getColor())
                .topicCount(col.getTopics() != null ? col.getTopics().size() : 0)
                .wordCount(wordCount)
                .topics(topicResponses)
                .build();
    }

    private VocabularyTopicResponse toTopicResponse(VocabularyTopic topic) {
        List<VocabularySubtopicResponse> subtopicResponses = null;
        if (topic.getSubtopics() != null) {
            subtopicResponses = topic.getSubtopics().stream()
                    .map(this::toSubtopicResponse)
                    .collect(Collectors.toList());
        }
        long wordCount = wordRepo.countBySubtopicTopicId(topic.getId());
        return VocabularyTopicResponse.builder()
                .id(topic.getId())
                .collectionId(topic.getCollection() != null ? topic.getCollection().getId() : null)
                .title(topic.getTitle())
                .description(topic.getDescription())
                .subtopicCount(topic.getSubtopics() != null ? topic.getSubtopics().size() : 0)
                .wordCount(wordCount)
                .subtopics(subtopicResponses)
                .build();
    }

    private VocabularySubtopicResponse toSubtopicResponse(VocabularySubtopic subtopic) {
        List<DLVocabularyWordResponse> wordResponses = null;
        if (subtopic.getWords() != null) {
            wordResponses = subtopic.getWords().stream()
                    .map(this::toWordResponse)
                    .collect(Collectors.toList());
        }
        return VocabularySubtopicResponse.builder()
                .id(subtopic.getId())
                .topicId(subtopic.getTopic() != null ? subtopic.getTopic().getId() : null)
                .title(subtopic.getTitle())
                .description(subtopic.getDescription())
                .wordCount(subtopic.getWords() != null ? subtopic.getWords().size() : 0)
                .words(wordResponses)
                .build();
    }

    private DLVocabularyWordResponse toWordResponse(DLVocabularyWord word) {
        return DLVocabularyWordResponse.builder()
                .id(word.getId())
                .subtopicId(word.getSubtopic() != null ? word.getSubtopic().getId() : null)
                .word(word.getWord())
                .pronunciation(word.getPronunciation())
                .meaning(word.getMeaning())
                .build();
    }

    private DocumentCategoryResponse toCategoryResponse(DocumentCategory cat) {
        return DocumentCategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .icon(cat.getIcon())
                .documentCount(cat.getDocuments() != null ? cat.getDocuments().size() : 0)
                .build();
    }

    private DLDocumentResponse toDocumentResponse(DLDocument doc) {
        return DLDocumentResponse.builder()
                .id(doc.getId())
                .categoryId(doc.getCategory() != null ? doc.getCategory().getId() : null)
                .title(doc.getTitle())
                .description(doc.getDescription())
                .views(doc.getViews())
                .downloadUrl(doc.getDownloadUrl())
                .build();
    }

    private UserVocabularyProgressResponse toProgressResponse(UserVocabularyProgress progress) {
        return UserVocabularyProgressResponse.builder()
                .id(progress.getId())
                .username(progress.getUsername())
                .subtopicId(progress.getSubtopicId())
                .learnedWordIds(progress.getLearnedWordIds())
                .awardedWordIds(progress.getAwardedWordIds())
                .build();
    }

    // ==========================================
    // Private entity finders
    // ==========================================

    private DLUser findUserEntityById(Long id) {
        return dlUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private VocabularyCollection findCollectionEntityById(Long id) {
        return collectionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found with id: " + id));
    }

    private VocabularyTopic findTopicEntityById(Long id) {
        return topicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));
    }

    private VocabularySubtopic findSubtopicEntityById(Long id) {
        return subtopicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found with id: " + id));
    }

    private DLVocabularyWord findWordEntityById(Long id) {
        return wordRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Word not found with id: " + id));
    }

    private DocumentCategory findCategoryEntityById(Long id) {
        return docCatRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document category not found with id: " + id));
    }

    private DLDocument findDocumentEntityById(Long id) {
        return docRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }

    // ==========================================
    // Users (Leaderboard / Admin CRUD)
    // ==========================================
    @Override
    public List<DLUserResponse> getAllUsers() {
        return dlUserRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DLUserResponse getUserById(Long id) {
        return toUserResponse(findUserEntityById(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "leaderboard", allEntries = true)
    public DLUserResponse createUser(DLUserRequest request) {
        DLUser user = DLUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .avatarUrl(request.getAvatarUrl())
                .points(request.getPoints() != null ? request.getPoints() : 0)
                .streak(request.getStreak() != null ? request.getStreak() : 0)
                .role(request.getRole() != null && !request.getRole().isEmpty() ? request.getRole() : "USER")
                .build();

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            user.setPassword(passwordUtil.encodePassword("123456"));
        } else {
            user.setPassword(passwordUtil.encodePassword(request.getPassword()));
        }
        return toUserResponse(dlUserRepository.save(user));
    }

    @Override
    @Transactional
    @CacheEvict(value = "leaderboard", allEntries = true)
    public DLUserResponse updateUser(Long id, DLUserRequest request) {
        DLUser user = findUserEntityById(id);
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getPoints() != null) user.setPoints(request.getPoints());
        if (request.getStreak() != null) user.setStreak(request.getStreak());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getRole() != null) user.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordUtil.encodePassword(request.getPassword()));
        }
        return toUserResponse(dlUserRepository.save(user));
    }

    @Override
    @Transactional
    @CacheEvict(value = "leaderboard", allEntries = true)
    public void deleteUser(Long id) {
        DLUser user = findUserEntityById(id);
        dlUserRepository.delete(user);
    }

    @Override
    @Cacheable(value = "leaderboard")
    public List<DLUserResponse> getLeaderboard() {
        List<DLUser> users = dlUserRepository.findAll();
        users.sort((u1, u2) -> {
            int p1 = u1.getPoints() != null ? u1.getPoints() : 0;
            int p2 = u2.getPoints() != null ? u2.getPoints() : 0;
            return Integer.compare(p2, p1);
        });
        return users.stream().limit(10)
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    // ==========================================
    // Vocabulary Level 1: Collections
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "collections")
    public List<VocabularyCollectionResponse> getAllCollections() {
        return collectionRepo.findAll().stream()
                .map(this::toCollectionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "collections", key = "#id")
    public VocabularyCollectionResponse getCollectionById(Long id) {
        return toCollectionResponse(findCollectionEntityById(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"collections", "topics", "subtopics"}, allEntries = true)
    public VocabularyCollectionResponse createCollection(VocabularyCollectionRequest request) {
        VocabularyCollection collection = VocabularyCollection.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .icon(request.getIcon() != null ? request.getIcon() : "school")
                .color(request.getColor() != null ? request.getColor() : "primary")
                .build();
        return toCollectionResponse(collectionRepo.save(collection));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"collections", "topics", "subtopics"}, allEntries = true)
    public VocabularyCollectionResponse updateCollection(Long id, VocabularyCollectionRequest request) {
        VocabularyCollection collection = findCollectionEntityById(id);
        collection.setTitle(request.getTitle());
        collection.setDescription(request.getDescription());
        if (request.getIcon() != null) collection.setIcon(request.getIcon());
        if (request.getColor() != null) collection.setColor(request.getColor());
        return toCollectionResponse(collectionRepo.save(collection));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"collections", "topics", "subtopics"}, allEntries = true)
    public void deleteCollection(Long id) {
        VocabularyCollection collection = findCollectionEntityById(id);
        collectionRepo.delete(collection);
    }

    // ==========================================
    // Vocabulary Level 2: Topics
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<VocabularyTopicResponse> getAllTopics() {
        return topicRepo.findAll().stream()
                .map(this::toTopicResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "topics", key = "#collectionId")
    public List<VocabularyTopicResponse> getTopicsByCollection(Long collectionId) {
        return topicRepo.findByCollectionId(collectionId).stream()
                .map(this::toTopicResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "topics", key = "'detail-' + #id")
    public VocabularyTopicResponse getTopicById(Long id) {
        return toTopicResponse(findTopicEntityById(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"topics", "collections"}, allEntries = true)
    public VocabularyTopicResponse createTopic(VocabularyTopicRequest request, Long collectionId) {
        VocabularyCollection collection = collectionId != null ? collectionRepo.findById(collectionId).orElse(null) : null;
        VocabularyTopic topic = VocabularyTopic.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .collection(collection)
                .build();
        return toTopicResponse(topicRepo.save(topic));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"topics", "collections"}, allEntries = true)
    public VocabularyTopicResponse updateTopic(Long id, VocabularyTopicRequest request) {
        VocabularyTopic topic = findTopicEntityById(id);
        topic.setTitle(request.getTitle());
        topic.setDescription(request.getDescription());
        if (request.getCollectionId() != null) {
            VocabularyCollection collection = collectionRepo.findById(request.getCollectionId()).orElse(null);
            topic.setCollection(collection);
        } else {
            topic.setCollection(null);
        }
        return toTopicResponse(topicRepo.save(topic));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"topics", "collections"}, allEntries = true)
    public void deleteTopic(Long id) {
        VocabularyTopic topic = findTopicEntityById(id);
        topicRepo.delete(topic);
    }

    // ==========================================
    // Vocabulary Level 3: Subtopics
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<VocabularySubtopicResponse> getAllSubtopics() {
        return subtopicRepo.findAll().stream()
                .map(this::toSubtopicResponse)
                .collect(Collectors.toList());
    }
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "subtopics", key = "#topicId")
    public List<VocabularySubtopicResponse> getSubtopicsByTopic(Long topicId) {
        return subtopicRepo.findByTopicId(topicId).stream()
                .map(this::toSubtopicResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "subtopics", key = "'detail-' + #id")
    public VocabularySubtopicResponse getSubtopicById(Long id) {
        return toSubtopicResponse(findSubtopicEntityById(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"subtopics", "topics", "collections"}, allEntries = true)
    public VocabularySubtopicResponse createSubtopic(VocabularySubtopicRequest request, Long topicId) {
        VocabularyTopic topic = findTopicEntityById(topicId);
        VocabularySubtopic subtopic = VocabularySubtopic.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .topic(topic)
                .build();
        return toSubtopicResponse(subtopicRepo.save(subtopic));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"subtopics", "topics", "collections"}, allEntries = true)
    public VocabularySubtopicResponse createSubtopicCompat(Long collectionId, VocabularySubtopicRequest request) {
        List<VocabularyTopic> topics = topicRepo.findByCollectionId(collectionId);
        VocabularyTopic targetTopic;
        if (topics.isEmpty()) {
            VocabularyCollection collection = findCollectionEntityById(collectionId);
            VocabularyTopic defaultTopic = VocabularyTopic.builder()
                    .title("Chủ đề chung")
                    .description("Chủ đề mặc định")
                    .collection(collection)
                    .build();
            targetTopic = topicRepo.save(defaultTopic);
        } else {
            targetTopic = topics.get(0);
        }

        VocabularySubtopic subtopic = VocabularySubtopic.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .topic(targetTopic)
                .build();
        return toSubtopicResponse(subtopicRepo.save(subtopic));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"subtopics", "topics", "collections"}, allEntries = true)
    public VocabularySubtopicResponse updateSubtopic(Long id, VocabularySubtopicRequest request) {
        VocabularySubtopic subtopic = findSubtopicEntityById(id);
        subtopic.setTitle(request.getTitle());
        subtopic.setDescription(request.getDescription());
        return toSubtopicResponse(subtopicRepo.save(subtopic));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"subtopics", "topics", "collections"}, allEntries = true)
    public void deleteSubtopic(Long id) {
        VocabularySubtopic subtopic = findSubtopicEntityById(id);
        subtopicRepo.delete(subtopic);
    }

    // ==========================================
    // Vocabulary Level 4: Words
    // ==========================================
    @Override
    @Cacheable(value = "words", key = "#subtopicId")
    public List<DLVocabularyWordResponse> getWordsBySubtopic(Long subtopicId) {
        return wordRepo.findBySubtopicId(subtopicId).stream()
                .map(this::toWordResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "words", key = "'detail-' + #id")
    public DLVocabularyWordResponse getWordById(Long id) {
        return toWordResponse(findWordEntityById(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"words", "subtopics"}, allEntries = true)
    public DLVocabularyWordResponse createWord(DLVocabularyWordRequest request, Long subtopicId) {
        VocabularySubtopic subtopic = findSubtopicEntityById(subtopicId);
        if (wordRepo.existsBySubtopicIdAndWordIgnoreCase(subtopicId, request.getWord())) {
            throw new IllegalArgumentException("Từ vựng này đã tồn tại trong chủ đề nhỏ!");
        }
        DLVocabularyWord word = DLVocabularyWord.builder()
                .word(request.getWord())
                .pronunciation(request.getPronunciation())
                .meaning(request.getMeaning())
                .subtopic(subtopic)
                .build();
        return toWordResponse(wordRepo.save(word));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"words", "subtopics"}, allEntries = true)
    public List<DLVocabularyWordResponse> bulkCreateWords(List<DLVocabularyWordRequest> requests, Long subtopicId) {
        VocabularySubtopic subtopic = findSubtopicEntityById(subtopicId);
        List<DLVocabularyWord> toSave = new ArrayList<>();
        for (DLVocabularyWordRequest req : requests) {
            if (req.getWord() == null || req.getWord().isBlank()) continue;
            if (wordRepo.existsBySubtopicIdAndWordIgnoreCase(subtopicId, req.getWord())) continue;
            toSave.add(DLVocabularyWord.builder()
                    .word(req.getWord())
                    .pronunciation(req.getPronunciation() != null ? req.getPronunciation() : "")
                    .meaning(req.getMeaning() != null && !req.getMeaning().isBlank() ? req.getMeaning() : "Chưa dịch")
                    .subtopic(subtopic)
                    .build());
        }
        return wordRepo.saveAll(toSave).stream().map(this::toWordResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"words", "subtopics"}, allEntries = true)
    public DLVocabularyWordResponse updateWord(Long id, DLVocabularyWordRequest request) {
        DLVocabularyWord word = findWordEntityById(id);
        word.setWord(request.getWord());
        word.setPronunciation(request.getPronunciation());
        word.setMeaning(request.getMeaning());
        return toWordResponse(wordRepo.save(word));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"words", "subtopics"}, allEntries = true)
    public void deleteWord(Long id) {
        DLVocabularyWord word = findWordEntityById(id);
        wordRepo.delete(word);
    }

    // ==========================================
    // User Progress
    // ==========================================
    @Override
    public List<UserVocabularyProgressResponse> getAllProgress(String username) {
        return progressRepo.findByUsername(username).stream()
                .map(this::toProgressResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserVocabularyProgressResponse getProgress(String username, Long subtopicId) {
        UserVocabularyProgress progress = progressRepo.findByUsernameAndSubtopicId(username, subtopicId)
                .orElse(UserVocabularyProgress.builder()
                        .username(username)
                        .subtopicId(subtopicId)
                        .learnedWordIds("")
                        .build());
        return toProgressResponse(progress);
    }

    @Override
    @Transactional
    @CacheEvict(value = "leaderboard", allEntries = true)
    public UserVocabularyProgressResponse updateProgress(String username, Long subtopicId, List<Long> learnedWordIds, String mode) {
        final String normalizedUsername = username != null ? username.trim().toLowerCase() : "";

        UserVocabularyProgress progress = progressRepo.findByUsernameAndSubtopicId(normalizedUsername, subtopicId)
                .orElseGet(() -> UserVocabularyProgress.builder()
                        .username(normalizedUsername)
                        .subtopicId(subtopicId)
                        .learnedWordIds("")
                        .awardedWordIds("")
                        .build());

        String oldIdsStr = progress.getLearnedWordIds();
        Set<Long> oldIds = new HashSet<>();
        if (oldIdsStr != null && !oldIdsStr.trim().isEmpty()) {
            for (String idStr : oldIdsStr.split(",")) {
                try {
                    oldIds.add(Long.parseLong(idStr.trim()));
                } catch (NumberFormatException ignored) {}
            }
        }

        String oldAwardedIdsStr = progress.getAwardedWordIds();
        Set<Long> oldAwardedIds = new HashSet<>();
        if (oldAwardedIdsStr != null && !oldAwardedIdsStr.trim().isEmpty()) {
            for (String idStr : oldAwardedIdsStr.split(",")) {
                try {
                    oldAwardedIds.add(Long.parseLong(idStr.trim()));
                } catch (NumberFormatException ignored) {}
            }
        }

        int pointsToAdd = 0;
        Set<Long> newAwardedIds = new HashSet<>(oldAwardedIds);
        if (learnedWordIds != null && ("quiz".equalsIgnoreCase(mode) || "write".equalsIgnoreCase(mode))) {
            for (Long wordId : learnedWordIds) {
                if (!oldAwardedIds.contains(wordId)) {
                    pointsToAdd += 10;
                    newAwardedIds.add(wordId);
                }
            }
        }

        String newAwardedStr = newAwardedIds.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        progress.setAwardedWordIds(newAwardedStr);

        Set<Long> mergedIds = new HashSet<>(oldIds);
        if (learnedWordIds != null) {
            mergedIds.addAll(learnedWordIds);
        }

        String idsStr = mergedIds.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        progress.setLearnedWordIds(idsStr);

        final int ptsToAdd = pointsToAdd;
        dlUserRepository.findByEmailIgnoreCase(normalizedUsername).ifPresent(user -> {
            int currentPoints = user.getPoints() != null ? user.getPoints() : 0;
            user.setPoints(Math.max(0, currentPoints + ptsToAdd));

            int currentStreak = user.getStreak() != null ? user.getStreak() : 0;
            LocalDateTime lastActiveTime = user.getLastActive();
            LocalDate today = LocalDate.now();

            if (currentStreak <= 0 || lastActiveTime == null) {
                user.setStreak(1);
            } else {
                LocalDate lastActiveDate = lastActiveTime.toLocalDate();
                if (lastActiveDate.equals(today.minusDays(1))) {
                    user.setStreak(currentStreak + 1);
                } else if (lastActiveDate.isBefore(today.minusDays(1))) {
                    user.setStreak(1);
                }
            }

            user.setLastActive(LocalDateTime.now());
            dlUserRepository.save(user);
        });

        return toProgressResponse(progressRepo.save(progress));
    }

    // ==========================================
    // Document Categories
    // ==========================================
    @Override
    @Transactional
    @Cacheable(value = "docCategories")
    public List<DocumentCategoryResponse> getAllDocumentCategories() {
        if (!docCatRepo.existsByName("Tiếng Anh")) {
            docCatRepo.save(DocumentCategory.builder().name("Tiếng Anh").icon("translate").build());
        }
        if (!docCatRepo.existsByName("Tiếng Nhật")) {
            docCatRepo.save(DocumentCategory.builder().name("Tiếng Nhật").icon("language_japanese_kana").build());
        }
        if (!docCatRepo.existsByName("Tiếng Trung")) {
            docCatRepo.save(DocumentCategory.builder().name("Tiếng Trung").icon("language_chinese_quick").build());
        }
        return docCatRepo.findAll().stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "docCategories", key = "#id")
    public DocumentCategoryResponse getDocumentCategoryById(Long id) {
        return toCategoryResponse(findCategoryEntityById(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "docCategories", allEntries = true)
    public DocumentCategoryResponse createDocumentCategory(DocumentCategoryRequest request) {
        DocumentCategory category = DocumentCategory.builder()
                .name(request.getName())
                .icon(request.getIcon() != null ? request.getIcon() : "folder")
                .build();
        return toCategoryResponse(docCatRepo.save(category));
    }

    @Override
    @Transactional
    @CacheEvict(value = "docCategories", allEntries = true)
    public DocumentCategoryResponse updateDocumentCategory(Long id, DocumentCategoryRequest request) {
        DocumentCategory category = findCategoryEntityById(id);
        category.setName(request.getName());
        if (request.getIcon() != null) category.setIcon(request.getIcon());
        return toCategoryResponse(docCatRepo.save(category));
    }

    @Override
    @Transactional
    @CacheEvict(value = "docCategories", allEntries = true)
    public void deleteDocumentCategory(Long id) {
        DocumentCategory category = findCategoryEntityById(id);
        docCatRepo.delete(category);
    }

    // ==========================================
    // Documents
    // ==========================================
    @Override
    @Cacheable(value = "documents", key = "#categoryId != null ? #categoryId : 'all'")
    public List<DLDocumentResponse> getAllDocuments(Long categoryId) {
        List<DLDocument> docs = categoryId != null ? docRepo.findByCategoryId(categoryId) : docRepo.findAll();
        return docs.stream()
                .map(this::toDocumentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "documents", key = "'detail-' + #id")
    public DLDocumentResponse getDocumentById(Long id) {
        return toDocumentResponse(findDocumentEntityById(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"documents", "docCategories"}, allEntries = true)
    public DLDocumentResponse createDocument(DLDocumentRequest request, Long categoryId) {
        DocumentCategory category = null;
        if (categoryId != null) {
            category = docCatRepo.findById(categoryId).orElse(null);
        }
        if (category == null) {
            List<DocumentCategory> cats = docCatRepo.findAll();
            if (cats.isEmpty()) {
                getAllDocumentCategories();
                cats = docCatRepo.findAll();
            }
            category = cats.get(0);
        }
        DLDocument document = DLDocument.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .downloadUrl(request.getDownloadUrl())
                .views(0)
                .category(category)
                .build();
        return toDocumentResponse(docRepo.save(document));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"documents", "docCategories"}, allEntries = true)
    public DLDocumentResponse updateDocument(Long id, DLDocumentRequest request, Long categoryId) {
        DLDocument doc = findDocumentEntityById(id);
        doc.setTitle(request.getTitle());
        doc.setDescription(request.getDescription());
        doc.setDownloadUrl(request.getDownloadUrl());
        if (categoryId != null) {
            DocumentCategory category = findCategoryEntityById(categoryId);
            doc.setCategory(category);
        }
        return toDocumentResponse(docRepo.save(doc));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"documents", "docCategories"}, allEntries = true)
    public void deleteDocument(Long id) {
        DLDocument doc = findDocumentEntityById(id);
        docRepo.delete(doc);
    }

    @Override
    @Transactional
    @CacheEvict(value = "documents", allEntries = true)
    public DLDocumentResponse incrementViews(Long id) {
        DLDocument doc = findDocumentEntityById(id);
        int currentViews = doc.getViews() != null ? doc.getViews() : 0;
        doc.setViews(currentViews + 1);
        return toDocumentResponse(docRepo.save(doc));
    }

    // ==========================================
    // Authentication
    // ==========================================
    @Override
    public DLUserResponse login(String email, String password) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        DLUser user = dlUserRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống."));
        if (!passwordUtil.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu không chính xác.");
        }
        return toUserResponse(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "leaderboard", allEntries = true)
    public DLUserResponse register(String name, String email, String password) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        if (dlUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Email đã được đăng ký trên hệ thống.");
        }
        DLUser user = DLUser.builder()
                .name(name)
                .email(normalizedEmail)
                .password(passwordUtil.encodePassword(password))
                .role("USER")
                .points(0)
                .streak(0)
                .build();
        return toUserResponse(dlUserRepository.save(user));
    }

    private String getDayOfWeekLabel(java.time.DayOfWeek dayOfWeek) {
        switch (dayOfWeek) {
            case MONDAY: return "T2";
            case TUESDAY: return "T3";
            case WEDNESDAY: return "T4";
            case THURSDAY: return "T5";
            case FRIDAY: return "T6";
            case SATURDAY: return "T7";
            case SUNDAY: return "CN";
            default: return "";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DLAdminStatisticsResponse getAdminStatistics() {
        long totalUsers = dlUserRepository.count();
        long totalCollections = collectionRepo.count();
        long totalSubCollections = subtopicRepo.count(); // Maps to subtopics count
        long totalWords = wordRepo.count();
        long totalDocuments = docRepo.count();
        
        long totalViews = docRepo.findAll().stream()
                .mapToLong(d -> d.getViews() != null ? d.getViews() : 0L)
                .sum();

        LocalDate today = LocalDate.now();
        List<DLAdminStatisticsResponse.DailyStat> dailyRegistrations = new ArrayList<>();
        List<DLAdminStatisticsResponse.DailyStat> dailyVisitors = new ArrayList<>();

        List<DLUser> allUsers = dlUserRepository.findAll();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            
            long regCount = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && 
                    u.getCreatedAt().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(date))
                .count();
            
            long visitCount = visitorRepo.findByVisitDate(date).map(DLVisitor::getCount).orElse(0L);
            
            String dayLabel = getDayOfWeekLabel(date.getDayOfWeek());
            dailyRegistrations.add(new DLAdminStatisticsResponse.DailyStat(dayLabel, regCount));
            dailyVisitors.add(new DLAdminStatisticsResponse.DailyStat(dayLabel, visitCount));
        }

        return DLAdminStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalCollections(totalCollections)
                .totalSubCollections(totalSubCollections)
                .totalWords(totalWords)
                .totalDocuments(totalDocuments)
                .totalViews(totalViews)
                .dailyRegistrations(dailyRegistrations)
                .dailyVisitors(dailyVisitors)
                .build();
    }

    @Override
    @Transactional
    public void recordVisit() {
        LocalDate today = LocalDate.now();
        DLVisitor visitor = visitorRepo.findByVisitDate(today)
                .orElseGet(() -> DLVisitor.builder().visitDate(today).count(0L).build());
        visitor.setCount(visitor.getCount() + 1);
        visitorRepo.save(visitor);
    }

    private DLChatMessageResponse toChatMessageResponse(DLChatMessage msg) {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("HH:mm");
        String formattedTime = msg.getCreatedAt() != null ? sdf.format(msg.getCreatedAt()) : "00:00";
        return DLChatMessageResponse.builder()
                .id(msg.getId())
                .sender(msg.getSender())
                .senderEmail(msg.getSenderEmail())
                .avatar(CloudinaryUtils.optimize(msg.getAvatar()))
                .text(msg.getText())
                .time(formattedTime)
                .isAdmin(msg.getIsAdmin())
                .build();
    }

    @Override
    @Transactional
    public List<DLChatMessageResponse> getChatMessages() {
        List<DLChatMessage> list = chatMessageRepo.findAll();
        return list.stream()
                .map(this::toChatMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DLChatMessageResponse saveChatMessage(String senderEmail, DLChatMessageRequest request) {
        DLUser user = dlUserRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + senderEmail));
        
        String avatarStr = user.getName() != null && !user.getName().isEmpty() 
                ? user.getName().substring(0, Math.min(2, user.getName().length())).toUpperCase() 
                : "U";

        DLChatMessage chatMsg = DLChatMessage.builder()
                .sender(user.getName())
                .senderEmail(user.getEmail())
                .avatar(avatarStr)
                .text(request.getText())
                .isAdmin("ADMIN".equalsIgnoreCase(user.getRole()))
                .build();

        DLChatMessage saved = chatMessageRepo.save(chatMsg);
        return toChatMessageResponse(saved);
    }

    @Override
    public PagedResponse<DLUserResponse> getAllUsers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<DLUser> usersPage = (search != null && !search.trim().isEmpty())
                ? dlUserRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable)
                : dlUserRepository.findAll(pageable);

        List<DLUserResponse> responses = usersPage.getContent().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());

        return PagedResponse.<DLUserResponse>builder()
                .content(responses)
                .pageNumber(usersPage.getNumber())
                .pageSize(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .build();
    }

    @Override
    public PagedResponse<DLVocabularyWordResponse> getAllWords(int page, int size, String search, Long subtopicId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<DLVocabularyWord> wordsPage;
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasSub = subtopicId != null;

        if (hasSub && hasSearch) {
            wordsPage = wordRepo.findBySubtopicIdAndWordContainingIgnoreCase(subtopicId, search, pageable);
        } else if (hasSub) {
            wordsPage = wordRepo.findBySubtopicId(subtopicId, pageable);
        } else if (hasSearch) {
            wordsPage = wordRepo.findByWordContainingIgnoreCase(search, pageable);
        } else {
            wordsPage = wordRepo.findAll(pageable);
        }

        List<DLVocabularyWordResponse> responses = wordsPage.getContent().stream()
                .map(this::toWordResponse)
                .collect(Collectors.toList());

        return PagedResponse.<DLVocabularyWordResponse>builder()
                .content(responses)
                .pageNumber(wordsPage.getNumber())
                .pageSize(wordsPage.getSize())
                .totalElements(wordsPage.getTotalElements())
                .totalPages(wordsPage.getTotalPages())
                .build();
    }

    @Override
    public PagedResponse<DLDocumentResponse> getAllDocuments(int page, int size, String search, Long categoryId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<DLDocument> docsPage;
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasCat = categoryId != null;

        if (hasCat && hasSearch) {
            docsPage = docRepo.findByCategoryIdAndTitleContainingIgnoreCase(categoryId, search, pageable);
        } else if (hasCat) {
            docsPage = docRepo.findByCategoryId(categoryId, pageable);
        } else if (hasSearch) {
            docsPage = docRepo.findByTitleContainingIgnoreCase(search, pageable);
        } else {
            docsPage = docRepo.findAll(pageable);
        }

        List<DLDocumentResponse> responses = docsPage.getContent().stream()
                .map(this::toDocumentResponse)
                .collect(Collectors.toList());

        return PagedResponse.<DLDocumentResponse>builder()
                .content(responses)
                .pageNumber(docsPage.getNumber())
                .pageSize(docsPage.getSize())
                .totalElements(docsPage.getTotalElements())
                .totalPages(docsPage.getTotalPages())
                .build();
    }
}

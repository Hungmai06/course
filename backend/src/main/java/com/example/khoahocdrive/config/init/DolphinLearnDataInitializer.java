package com.example.khoahocdrive.config.init;

import com.example.khoahocdrive.english48ngay.entity.*;
import com.example.khoahocdrive.english48ngay.repository.*;
import com.example.khoahocdrive.supports.utils.PasswordUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DolphinLearnDataInitializer {

    private final VocabularyCollectionRepository collectionRepo;
    private final DLVocabularyWordRepository wordRepo;
    private final DocumentCategoryRepository docCatRepo;
    private final DLDocumentRepository docRepo;
    private final DLUserRepository dlUserRepo;
    private final PasswordUtil passwordUtil;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        initUsers();
        initVocabulary();
        initDocuments();
    }

    private void initUsers() {
        if (dlUserRepo.count() == 0) {
            log.info("Seeding DolphinLearn Admin User...");
            dlUserRepo.save(
                    DLUser.builder().name("Dolphin Learn (Admin").email("maivanhung0604@gmail.com")
                            .password(passwordUtil.encodePassword("Hungmai06042003@")).points(0).streak(0).role("ADMIN")
                            .build());
            log.info("DolphinLearn Admin User seeded successfully.");
        } else {
            log.info("Checking for unencrypted passwords in database...");
            List<DLUser> users = dlUserRepo.findAll();
            boolean updated = false;
            for (DLUser user : users) {
                String pw = user.getPassword();
                if (pw != null && !pw.startsWith("$2a$") && !pw.startsWith("$2b$") && !pw.startsWith("$2y$")) {
                    user.setPassword(passwordUtil.encodePassword(pw));
                    dlUserRepo.save(user);
                    updated = true;
                    log.info("Encrypted password for user: {}", user.getEmail());
                }
            }
            if (updated) {
                log.info("All plain-text passwords encrypted successfully.");
            } else {
                log.info("No plain-text passwords found.");
            }
        }
    }

    private void initVocabulary() {
        // Do not automatically seed vocabulary
    }

    private void initDocuments() {
        log.info("Checking DolphinLearn Document Categories...");
        if (!docCatRepo.existsByName("Tiếng Anh")) {
            docCatRepo.save(DocumentCategory.builder().name("Tiếng Anh").icon("translate").build());
            log.info("Seeded category: Tiếng Anh");
        }
        if (!docCatRepo.existsByName("Tiếng Nhật")) {
            docCatRepo.save(DocumentCategory.builder().name("Tiếng Nhật").icon("language_japanese_kana").build());
            log.info("Seeded category: Tiếng Nhật");
        }
        if (!docCatRepo.existsByName("Tiếng Trung")) {
            docCatRepo.save(DocumentCategory.builder().name("Tiếng Trung").icon("language_chinese_quick").build());
            log.info("Seeded category: Tiếng Trung");
        }
        if (!docCatRepo.existsByName("Thiết Kế")) {
            docCatRepo.save(DocumentCategory.builder().name("Thiết kế").icon("language_chinese_quick").build());
            log.info("Seeded category: Thiết kế");
        }
        List<DocumentCategory> categories = docCatRepo.findAll()
        .stream()
        .filter(c -> "Thiết kế".equals(c.getName()))
        .toList();

if (categories.isEmpty()) {
    docCatRepo.save(
        DocumentCategory.builder()
            .name("Thiết kế")
            .icon("language_chinese_quick")
            .build()
    );
} else if (categories.size() > 1) {
    DocumentCategory keep = categories.get(0);
    categories.remove(keep);
    docCatRepo.deleteAll(categories);
}
        if (!docCatRepo.existsByName("Lập Trình")) {
            docCatRepo.save(DocumentCategory.builder().name("Lập Trình").icon("language_chinese_quick").build());
            log.info("Seeded category: Lập Trình");
        }
        if (!docCatRepo.existsByName("Khác")) {
            docCatRepo.save(DocumentCategory.builder().name("Khác").icon("language_chinese_quick").build());
            log.info("Seeded category: Khác");
        }
    }
}

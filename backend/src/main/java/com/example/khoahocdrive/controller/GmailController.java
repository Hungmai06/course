package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.service.Impl.GmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gmail")
@RequiredArgsConstructor
public class GmailController {

    private final GmailService gmailService;

    /** API để test thủ công đọc mail */
    @PostMapping("/read-mails")
    public ResponseEntity<String> readEmails() {
        try {
            gmailService.readTimoSuccessEmails();
            return ResponseEntity.ok("Đã xử lý xong email.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}

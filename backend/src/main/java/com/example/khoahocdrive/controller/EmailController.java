package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.models.Order;
import com.example.khoahocdrive.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.mail.MessagingException;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/email")
public class EmailController {
    private final EmailService emailService;

    @GetMapping("/")
    @Operation(summary = "Send Email")
    public void sendEmail(@RequestParam String to, @RequestParam String object,@RequestBody Order order) throws MessagingException {
        emailService.sendEmail(to,object,order);
    }
}

package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.ConfirmRequest;
import com.example.khoahocdrive.dto.request.VietQrRequest;
import com.example.khoahocdrive.service.VietQrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Tag(name = "VietQr API")
public class VietQrController {
    private final VietQrService vietQrService;
    @PostMapping("/create-vietqr-url")
    @Operation(summary = "Create Url VietQr")
    public ResponseEntity<String> createPaymentUrl(
            @RequestBody VietQrRequest vnPayRequest
    ) {
        String paymentUrl = vietQrService.createQrPayment(
                vnPayRequest.getOrderId(),
                vnPayRequest.getAmount(),
                vnPayRequest.getDescription()
        );
        System.out.println(paymentUrl);
        return ResponseEntity.ok(paymentUrl);
    }

//    @GetMapping("/confirm")
//    public void confirm(@RequestParam String description) {
//        vietQrService.confirm(description);
//    }
}

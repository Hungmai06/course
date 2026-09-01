package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.ConfirmRequest;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.models.Bill;
import com.example.khoahocdrive.models.Order;
import com.example.khoahocdrive.models.OrderDetail;
import com.example.khoahocdrive.models.Transaction;
import com.example.khoahocdrive.repository.BillRepository;
import com.example.khoahocdrive.repository.OrderRepository;
import com.example.khoahocdrive.repository.TransactionRepository;
import com.example.khoahocdrive.service.CartService;
import com.example.khoahocdrive.service.EmailService;
import com.example.khoahocdrive.service.GoogleDriveService;
import com.example.khoahocdrive.service.VietQrService;
import com.example.khoahocdrive.supports.enums.OrderStatus;
import com.example.khoahocdrive.supports.enums.TransactionStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.ContentNegotiatingViewResolver;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VietQrServiceImpl implements VietQrService {
    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final GoogleDriveService googleDriveService;
    private final CartService cartService;
    private final BillRepository billRepository;

    @Value("${vietqr.client-id}")
    private String clientId;

    @Value("${vietqr.api-key}")
    private String apiKey;

    @Value("${vietqr.generate-url}")
    private String generateUrl;

    @Value("${vietqr.account-no}")
    private String accountNo;

    @Value("${vietqr.account-name}")
    private String accountName;

    @Value("${vietqr.account-acq-id}")
    private String acqId;

    @Value("${vietqr.account-template}")
    private String template;

    @Override
    public String createQrPayment(Long orderId, BigDecimal amount, String description) {
        // Lấy đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Check giao dịch trước đó
        Optional<Transaction> latestTxn = transactionRepository.findByOrder(order).stream()
                .sorted(Comparator.comparing(Transaction::getCreatedAt).reversed())
                .findFirst();

        if (latestTxn.isPresent() && latestTxn.get().getStatus() == TransactionStatus.SUCCESS) {
            throw new RuntimeException("Đơn hàng đã thanh toán thành công.");
        }
        latestTxn.ifPresent(txn -> {
            txn.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(txn);
        });

        // Đặt trạng thái đơn hàng
        order.setStatus(OrderStatus.PENDING);
        orderRepository.save(order);

        // Tạo mã giao dịch
        String txnRef = "VQR" + System.currentTimeMillis();

        // Lưu giao dịch
        Transaction transaction = Transaction.builder()
                .transactionRef(txnRef)
                .paymentMethod("VIETQR")
                .status(TransactionStatus.PENDING)
                .amount(amount.doubleValue())
                .order(order)
                .build();
        transactionRepository.save(transaction);

        // Làm sạch dữ liệu để mã QR chuẩn hóa 100% theo EMVCo (không dính dấu câu, quotes, hay decimal số tiền)
        String cleanAccountName = accountName != null ? accountName.replace("\"", "").trim() : "MAI VAN HUNG";
        long cleanAmount = amount != null ? amount.longValue() : 0L;
        String cleanAddInfo = description != null ? description.trim() : "THANHTOAN";

        // Gọi API VietQR với fallback an toàn
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> requestData = Map.of(
                    "accountNo", accountNo,
                    "accountName", cleanAccountName,
                    "acqId", Integer.parseInt(acqId),
                    "amount", cleanAmount,
                    "addInfo", cleanAddInfo,
                    "template", template != null ? template : "compact2"
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    generateUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getBody() != null && response.getBody().get("data") != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                if (data != null && data.get("qrDataURL") != null) {
                    return (String) data.get("qrDataURL");
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi API VietQR, chuyển sang dùng URL VietQR public fallback: {}", e.getMessage());
        }

        // Fallback URL nếu API VietQR gặp lỗi
        try {
            String encodedAddInfo = java.net.URLEncoder.encode(cleanAddInfo, java.nio.charset.StandardCharsets.UTF_8.name());
            String encodedAccountName = java.net.URLEncoder.encode(cleanAccountName, java.nio.charset.StandardCharsets.UTF_8.name());
            return String.format("https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                    acqId, accountNo, template != null ? template : "compact2", cleanAmount, encodedAddInfo, encodedAccountName);
        } catch (Exception e) {
            return String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d", acqId, accountNo, cleanAmount);
        }
    }


    @Override
    public boolean checkPaymentStatus(String description) {
        if (description == null || description.trim().isEmpty()) {
            return false;
        }
        Optional<Order> orderOpt = orderRepository.findByDescription(description.trim());
        if (orderOpt.isEmpty()) {
            orderOpt = orderRepository.findByBillDescription(description.trim());
        }
        return orderOpt.isPresent() && orderOpt.get().getStatus() == OrderStatus.SUCCESS;
    }

    @Override
    @Transactional
    public void confirmBill(Bill bill) {

        // ✅ Chống xử lý lại
        if (Boolean.TRUE.equals(bill.getProcessed())) {
            log.info("Bill already processed: billId={}", bill.getId());
            return;
        }


        // 1) Find order by description

        var optionalOrder = orderRepository.findByBillDescription(bill.getDescription());

        if (optionalOrder.isEmpty()) {
            log.warn("Không tìm thấy order theo description: {}", bill.getDescription());
            return;
        }

        Order order = optionalOrder.get();

        // ✅ Nếu order đã SUCCESS thì coi như xong (idempotent)
        if (order.getStatus() == OrderStatus.SUCCESS) {
            bill.setProcessed(true);
            billRepository.save(bill);
            return;
        }

        // 2) Compare amount
        if (order.getTotalAmount().compareTo(bill.getAmount()) != 0) {
            log.warn("Sai số tiền: orderId={}, orderAmount={}, billAmount={}",
                    order.getId(), order.getTotalAmount(), bill.getAmount());
            return;
        }

        // 3) Update transaction
        Transaction transaction = transactionRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy transaction cho orderId=" + order.getId()));
        transaction.setStatus(TransactionStatus.SUCCESS);
        transactionRepository.save(transaction);

        // 4) Update order status
        order.setStatus(OrderStatus.SUCCESS);
        orderRepository.save(order);

        // 5) Send email
        try {
            emailService.sendEmail(order.getEmail(), "Xác nhận thanh toán thành công", order);
        } catch (Exception e) {
            log.error("Lỗi gửi email xác nhận thanh toán: {}", e.getMessage(), e);
        }

        // 6) Grant Drive
        String email = order.getEmail();
        for (OrderDetail detail : order.getOrderDetails()) {
            String driveLink = detail.getCourse().getLinkDrive();
            try {
                googleDriveService.grantPermissionViaHttp(driveLink, email);
            } catch (Exception e) {
                log.error("Không thể cấp quyền cho link: {}, lỗi: {}", driveLink, e.getMessage(), e);
            }
        }

        // 7) Clear cart
        if (order.getUser() != null) {
            cartService.clearCart(order.getUser().getId());
        }

        // ✅ Mark bill processed (xong hết mới mark)
        bill.setProcessed(true);
        billRepository.save(bill);

        log.info("Confirm success: billId={}, orderId={}", bill.getId(), order.getId());
    }

}


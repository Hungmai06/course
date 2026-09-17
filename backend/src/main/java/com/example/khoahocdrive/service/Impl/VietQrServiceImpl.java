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

import com.example.khoahocdrive.models.FullCourseConfig;
import com.example.khoahocdrive.repository.FullCourseConfigRepository;
import com.example.khoahocdrive.models.Course;

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
    private final FullCourseConfigRepository fullCourseConfigRepository;

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

        long cleanAmount = amount != null ? amount.longValue() : 0L;
        String cleanAddInfo = description != null ? description.trim() : "";

        // Trả về trực tiếp URL VietQR theo đúng mẫu yêu cầu:
        // https://img.vietqr.io/image/970454-0328028026-compact2.png?amount=SOTIEN&addInfo=NOIDUNG&accountName=MAI%20VAN%20HUNG
        try {
            String encodedAddInfo = java.net.URLEncoder.encode(cleanAddInfo, java.nio.charset.StandardCharsets.UTF_8.name());
            String quickLinkUrl = String.format("https://img.vietqr.io/image/970454-0328028026-compact2.png?amount=%d&addInfo=%s&accountName=MAI%%20VAN%%20HUNG",
                    cleanAmount, encodedAddInfo);
            
            log.info("Generated VietQR QuickLink URL: {}", quickLinkUrl);
            return quickLinkUrl;
        } catch (Exception e) {
            return String.format("https://img.vietqr.io/image/970454-0328028026-compact2.png?amount=%d&addInfo=%s&accountName=MAI%%20VAN%%20HUNG",
                    cleanAmount, cleanAddInfo);
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

        // 6) Grant Drive - cấp quyền cả linkDrive (Link 1) VÀ linkDrive2 (Link 2)
        String email = order.getEmail();
        if (email != null && !email.isBlank()) {
            if (order.getOrderDetails() != null) {
                for (OrderDetail detail : order.getOrderDetails()) {
                    Course course = detail.getCourse();
                    if (course != null) {
                        // Grant Link 1
                        if (course.getLinkDrive() != null && !course.getLinkDrive().isBlank()) {
                            try {
                                googleDriveService.grantPermissionViaHttp(course.getLinkDrive().trim(), email);
                            } catch (Exception e) {
                                log.error("Không thể cấp quyền linkDrive: {}, lỗi: {}", course.getLinkDrive(), e.getMessage());
                            }
                        }
                        // Grant Link 2
                        if (course.getLinkDrive2() != null && !course.getLinkDrive2().isBlank()) {
                            try {
                                googleDriveService.grantPermissionViaHttp(course.getLinkDrive2().trim(), email);
                            } catch (Exception e) {
                                log.error("Không thể cấp quyền linkDrive2: {}, lỗi: {}", course.getLinkDrive2(), e.getMessage());
                            }
                        }
                    }
                }
            }

            // Fallback: Nếu đơn hàng là Full Course hoặc orderDetails rỗng, cũng tự động cấp quyền 2 link từ FullCourseConfig
            FullCourseConfig config = fullCourseConfigRepository.findById(1L).orElse(null);
            if (config != null) {
                boolean isFcOrder = (order.getOrderDetails() == null || order.getOrderDetails().isEmpty())
                        || order.getOrderDetails().stream().anyMatch(od -> od.getCourse() != null && (Boolean.TRUE.equals(od.getCourse().getIsFullCourse()) || "full-course".equalsIgnoreCase(od.getCourse().getSlug())));
                if (isFcOrder) {
                    if (config.getLinkDrive() != null && !config.getLinkDrive().isBlank()) {
                        try {
                            googleDriveService.grantPermissionViaHttp(config.getLinkDrive().trim(), email);
                        } catch (Exception e) {
                            log.error("Không thể cấp quyền config linkDrive: {}, lỗi: {}", config.getLinkDrive(), e.getMessage());
                        }
                    }
                    if (config.getLinkDrive2() != null && !config.getLinkDrive2().isBlank()) {
                        try {
                            googleDriveService.grantPermissionViaHttp(config.getLinkDrive2().trim(), email);
                        } catch (Exception e) {
                            log.error("Không thể cấp quyền config linkDrive2: {}, lỗi: {}", config.getLinkDrive2(), e.getMessage());
                        }
                    }
                }
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


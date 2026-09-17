package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.OrderRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.OrderDetailResponse;
import com.example.khoahocdrive.dto.response.OrderResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.exceptions.ForBiddenException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.models.*;
import com.example.khoahocdrive.repository.*;
import com.example.khoahocdrive.service.CartService;
import com.example.khoahocdrive.service.GoogleDriveService;
import com.example.khoahocdrive.service.OrderService;
import com.example.khoahocdrive.service.VietQrService;
import com.example.khoahocdrive.supports.enums.OrderStatus;
import com.example.khoahocdrive.supports.enums.TransactionStatus;
import com.example.khoahocdrive.supports.utils.CloudinaryUtils;
import com.example.khoahocdrive.supports.utils.PaginationUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final DiscountCodeRepository discountCodeRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PaginationUtil paginationUtil;
    private final TransactionRepository transactionRepository;
    private final BillRepository billRepository;
    private final VietQrService vietQrService;
    private final EmailServiceImpl emailService;
    private final GoogleDriveService googleDriveService;
    private final CartService cartService;
    private final FullCourseConfigRepository fullCourseConfigRepository;

    @Override
    public ApiResponse<OrderResponse> create(OrderRequest request) {
        if (request.getCourseIds() == null || request.getCourseIds().isEmpty()) {
            throw new ResourceNotFoundException("Vui lòng chọn khóa học để thanh toán");
        }

        FullCourseConfig fullCourseConfig = fullCourseConfigRepository.findById(1L).orElse(null);
        List<Course> courses = courseRepository.findAllById(request.getCourseIds());

        BigDecimal total = BigDecimal.ZERO;
        for (Long cId : request.getCourseIds()) {
            Optional<Course> cOpt = courses.stream().filter(c -> c.getId().equals(cId)).findFirst();
            if (cOpt.isPresent()) {
                Course c = cOpt.get();
                if (Boolean.TRUE.equals(c.getIsFullCourse()) || "full-course".equalsIgnoreCase(c.getSlug())) {
                    BigDecimal fullPrice = (fullCourseConfig != null && fullCourseConfig.getNewPrice() != null)
                            ? fullCourseConfig.getNewPrice()
                            : (c.getNewPrice() != null ? c.getNewPrice() : new BigDecimal("599000"));
                    total = total.add(fullPrice);
                } else {
                    total = total.add(c.getNewPrice() != null ? c.getNewPrice() : BigDecimal.ZERO);
                }
            } else if (fullCourseConfig != null) {
                total = total.add(fullCourseConfig.getNewPrice() != null ? fullCourseConfig.getNewPrice() : new BigDecimal("599000"));
            }
        }

        if (total.compareTo(BigDecimal.ZERO) <= 0 && courses.isEmpty() && fullCourseConfig == null) {
            throw new ResourceNotFoundException("Khóa học không hợp lệ");
        }

        BigDecimal discountPrice = BigDecimal.ZERO;
        DiscountCode discountCode = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discountCode = discountCodeRepository.findDiscountCodeByCode(request.getCouponCode().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));

            if (discountCode.getStartDate().after(new Date())) {
                throw new ResourceNotFoundException("Mã giảm giá chưa đến thời gian kích hoạt");
            }
            if (discountCode.getExpiredDate().before(new Date())) {
                throw new ResourceNotFoundException("Mã giảm giá đã hết hạn");
            }
            if (total.compareTo(discountCode.getMinimumOrder()) < 0) {
                throw new ResourceNotFoundException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này");
            }

            discountPrice = total.multiply(discountCode.getDiscountPercent())
                    .divide(BigDecimal.valueOf(100));
        }

        BigDecimal finalAmount = total.subtract(discountPrice);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }

        Order order = Order.builder()
                .phone(request.getPhone())
                .email(request.getEmail())
                .user(user)
                .totalAmount(finalAmount)
                .description(request.getDescription().trim())
                .status(OrderStatus.PENDING)
                .username(request.getFullName())
                .discountCode(discountCode)
                .build();

        List<OrderDetail> orderDetails = new ArrayList<>();
        if (!courses.isEmpty()) {
            for (Course course : courses) {
                OrderDetail orderDetail = OrderDetail.builder()
                        .order(order)
                        .quantity(1)
                        .course(course)
                        .build();
                orderDetails.add(orderDetail);
            }
        } else {
            Course fcEntity = courseRepository.findCourseBySlug("full-course").orElse(null);
            if (fcEntity != null) {
                OrderDetail orderDetail = OrderDetail.builder()
                        .order(order)
                        .quantity(1)
                        .course(fcEntity)
                        .build();
                orderDetails.add(orderDetail);
            }
        }

        order.setOrderDetails(orderDetails);
        orderRepository.save(order);

        return ApiResponse.<OrderResponse>builder()
                .data(toResponse(order))
                .message("Create order successfully")
                .build();
    }

    @Override
    public ApiResponse<List<OrderResponse>> getAllByUserName(String username) {
        List<Order> orders = orderRepository.findByUserUsername(username); // ✅ entityGraph
        List<OrderResponse> orderResponses = orders.stream().map(this::toResponse).toList();
        return ApiResponse.<List<OrderResponse>>builder()
                .message("Get All Order By UserName")
                .data(orderResponses)
                .build();
    }

    @Override
    public ApiResponse<OrderResponse> getById(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Order order = orderRepository.findById(id) // ✅ entityGraph
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getUser() == null || !order.getUser().getUsername().equals(username)) {
            throw new ForBiddenException("You cannot access this order");
        }

        return ApiResponse.<OrderResponse>builder()
                .data(toResponse(order))
                .message("Get Order By Id")
                .build();
    }

    @Override
    public ApiResponse<OrderResponse> update(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(status);
        Bill bill = null;
        if(status == OrderStatus.SUCCESS){
            Optional<Bill> optionalBill =  billRepository.findByDescriptionContaining(order.getDescription());
            if(optionalBill.isEmpty()) {
                bill = Bill.builder()
                        .messageId("Bổ sung tự động"+order.getDescription())
                        .amount(order.getTotalAmount())
                        .description(order.getDescription())
                        .processed(false)
                        .build();
                billRepository.save(bill);
            } else {
                bill = optionalBill.get();
            }

            // 2) Compare amount
            if (order.getTotalAmount().compareTo(bill.getAmount()) != 0 ) {
                log.warn("Sai số tiền: orderId={}, orderAmount={}, billAmount={}",
                        order.getId(), order.getTotalAmount(), bill.getAmount());
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

            // 6) Grant Drive - cấp quyền cả linkDrive VÀ linkDrive2 (Full Course có 2 link)
            String email = order.getEmail();
            for (OrderDetail detail : order.getOrderDetails()) {
                Course grantedCourse = detail.getCourse();
                // Grant linkDrive chính
                String driveLink = grantedCourse.getLinkDrive();
                if (driveLink != null && !driveLink.isBlank()) {
                    try {
                        googleDriveService.grantPermissionViaHttp(driveLink, email);
                    } catch (Exception e) {
                        log.error("Không thể cấp quyền cho linkDrive: {}, lỗi: {}", driveLink, e.getMessage(), e);
                    }
                }
                // Grant linkDrive2 dự phòng (Full Course)
                String driveLink2 = grantedCourse.getLinkDrive2();
                if (driveLink2 != null && !driveLink2.isBlank()) {
                    try {
                        googleDriveService.grantPermissionViaHttp(driveLink2, email);
                    } catch (Exception e) {
                        log.error("Không thể cấp quyền cho linkDrive2: {}, lỗi: {}", driveLink2, e.getMessage(), e);
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
        orderRepository.save(order);

        return ApiResponse.<OrderResponse>builder()
                .data(toResponse(order))
                .message("Cập nhat thành công trạng thái đơn hàng")
                .build();
    }

    @Override
    public ApiResponse<PagedResponse<OrderResponse>> getAll(int page, int size, String sortBy, String sortDir) {
        Sort sort = "desc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> orderPage = orderRepository.findAll(pageable); // ✅ entityGraph override

        List<OrderResponse> orderResponses = orderPage.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        PagedResponse<OrderResponse> pagedResponse = PagedResponse.<OrderResponse>builder()
                .content(orderResponses)
                .totalPages(orderPage.getTotalPages())
                .totalElements(orderPage.getTotalElements())
                .pageSize(orderPage.getSize())
                .pageNumber(orderPage.getNumber())
                .build();

        return ApiResponse.<PagedResponse<OrderResponse>>builder()
                .data(pagedResponse)
                .message("Get all order")
                .build();
    }

    @Override
    public ApiResponse<PagedResponse<OrderResponse>> findOrder(int page, int size, String keyword, String sortBy, String sortDir) {
        Sort sort = "desc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Order> orderPage = orderRepository.findOrder(keyword, pageable);

        List<OrderResponse> orderResponses = orderPage.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        PagedResponse<OrderResponse> pagedResponse = PagedResponse.<OrderResponse>builder()
                .totalPages(orderPage.getTotalPages())
                .totalElements(orderPage.getTotalElements())
                .pageSize(orderPage.getSize())
                .pageNumber(orderPage.getNumber())
                .content(orderResponses)
                .build();

        return ApiResponse.<PagedResponse<OrderResponse>>builder()
                .message("Look for user information")
                .data(pagedResponse)
                .build();
    }
    @Override
    @Transactional
    public void deleteOrder() {
        List<Order> orders = orderRepository.findOrderByStatus();
        for (Order order : orders) {
            if (order.getTransaction() != null) {
                transactionRepository.delete(order.getTransaction());
            }
            if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
                orderDetailRepository.deleteAll(order.getOrderDetails());
            }
            orderRepository.delete(order);
        }
    }

    @Override
    public ApiResponse<OrderResponse> updateEmail(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setEmail(email);
        orderRepository.save(order);
        return ApiResponse.<OrderResponse>builder()
                .data(toResponse(order))
                .message("Update email success")
                .build();
    }

    // ✅ FIX N+1: không query courseRepository.findById trong loop nữa
    private OrderResponse toResponse(Order order) {

        BigDecimal total = order.getOrderDetails().stream()
                .filter(od -> od.getCourse() != null && od.getCourse().getNewPrice() != null)
                .map(od -> od.getCourse().getNewPrice().multiply(BigDecimal.valueOf(od.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountPrice = BigDecimal.ZERO;
        if (order.getDiscountCode() != null && order.getDiscountCode().getDiscountPercent() != null) {
            discountPrice = total.multiply(order.getDiscountCode().getDiscountPercent())
                    .divide(BigDecimal.valueOf(100));
        }

        return OrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .email(order.getEmail())
                .phone(order.getPhone())
                .description(order.getDescription())
                .totalAmount(total)
                .discountAmount(discountPrice)
                .finalAmount(total.subtract(discountPrice))
                .discountCode(order.getDiscountCode() != null ? order.getDiscountCode().getCode() : null)
                .items(order.getOrderDetails().stream().map(od ->
                        OrderDetailResponse.builder()
                                .id(od.getId())
                                .orderId(order.getId())
                                .courseId(od.getCourse() != null ? od.getCourse().getId() : null)
                                .courseName(od.getCourse() != null ? od.getCourse().getName() : null)
                                .coursePrice(od.getCourse() != null ? od.getCourse().getNewPrice() : null)
                                .avatar(od.getCourse() != null ? CloudinaryUtils.optimize(od.getCourse().getAvatar()) : null)
                                .totalPrice(
                                        (od.getCourse() != null && od.getCourse().getNewPrice() != null)
                                                ? BigDecimal.valueOf(od.getQuantity()).multiply(od.getCourse().getNewPrice())
                                                : BigDecimal.ZERO
                                )
                                .quantity(od.getQuantity())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }
}

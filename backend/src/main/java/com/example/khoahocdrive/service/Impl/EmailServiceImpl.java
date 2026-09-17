package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.models.FullCourseConfig;
import com.example.khoahocdrive.repository.FullCourseConfigRepository;
import com.example.khoahocdrive.models.OrderDetail;
import com.example.khoahocdrive.dto.response.OrderDetailResponse;
import com.example.khoahocdrive.dto.response.OrderResponse;
import com.example.khoahocdrive.models.Course;
import com.example.khoahocdrive.models.Order;
import com.example.khoahocdrive.repository.CourseRepository;
import com.example.khoahocdrive.service.EmailService;
import com.example.khoahocdrive.supports.utils.CloudinaryUtils;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final CourseRepository courseRepository;
    private final FullCourseConfigRepository fullCourseConfigRepository;

    public void sendEmail(String toEmail, String subject, Order order) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        OrderResponse orderResponse = toResponse(order);

        List<Map<String, String>> courseLinks = new ArrayList<>();

        if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Course course = detail.getCourse();
                if (course != null) {
                    boolean hasLink2 = course.getLinkDrive2() != null && !course.getLinkDrive2().isBlank();
                    // Link 1 (Chính)
                    if (course.getLinkDrive() != null && !course.getLinkDrive().isBlank()) {
                        Map<String, String> map1 = new HashMap<>();
                        map1.put("name", course.getName() + (hasLink2 ? " - Link 1 (Chính)" : ""));
                        map1.put("url", course.getLinkDrive().trim());
                        courseLinks.add(map1);
                    }
                    // Link 2 (Dự phòng)
                    if (hasLink2) {
                        Map<String, String> map2 = new HashMap<>();
                        map2.put("name", course.getName() + " - Link 2 (Dự phòng)");
                        map2.put("url", course.getLinkDrive2().trim());
                        courseLinks.add(map2);
                    }
                }
            }
        }

        // Bổ sung: Nếu đơn hàng là Full Course hoặc orderDetails rỗng, tự động lấy link từ FullCourseConfig
        FullCourseConfig fullConfig = fullCourseConfigRepository.findById(1L).orElse(null);
        if (fullConfig != null) {
            boolean isFullCourseOrder = (order.getOrderDetails() == null || order.getOrderDetails().isEmpty())
                    || order.getOrderDetails().stream().anyMatch(od -> od.getCourse() != null && (Boolean.TRUE.equals(od.getCourse().getIsFullCourse()) || "full-course".equalsIgnoreCase(od.getCourse().getSlug())));

            if (isFullCourseOrder) {
                if (fullConfig.getLinkDrive() != null && !fullConfig.getLinkDrive().isBlank()) {
                    boolean alreadyAdded = courseLinks.stream().anyMatch(m -> fullConfig.getLinkDrive().trim().equalsIgnoreCase(m.get("url")));
                    if (!alreadyAdded) {
                        Map<String, String> map1 = new HashMap<>();
                        map1.put("name", fullConfig.getName() + " - Link 1 (Chính)");
                        map1.put("url", fullConfig.getLinkDrive().trim());
                        courseLinks.add(map1);
                    }
                }
                if (fullConfig.getLinkDrive2() != null && !fullConfig.getLinkDrive2().isBlank()) {
                    boolean alreadyAdded2 = courseLinks.stream().anyMatch(m -> fullConfig.getLinkDrive2().trim().equalsIgnoreCase(m.get("url")));
                    if (!alreadyAdded2) {
                        Map<String, String> map2 = new HashMap<>();
                        map2.put("name", fullConfig.getName() + " - Link 2 (Dự phòng)");
                        map2.put("url", fullConfig.getLinkDrive2().trim());
                        courseLinks.add(map2);
                    }
                }
            }
        }

        Context context = new Context();
        context.setVariable("name", orderResponse.getEmail());
        context.setVariable("orderId", orderResponse.getOrderId());
        context.setVariable("totalAmount", orderResponse.getTotalAmount());
        context.setVariable("discountAmount", orderResponse.getDiscountAmount());
        context.setVariable("finalAmount", orderResponse.getFinalAmount());
        context.setVariable("description", order.getDescription());
        context.setVariable("courseLinks", courseLinks);

        String htmlContent = templateEngine.process("email", context);

        helper.setTo(toEmail);
        helper.setCc("maivanhung0604@gmail.com");
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    @Override
    public void sendEmailOTP(String toEmail, String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        Context context = new Context();
        context.setVariable("otp", otp);
        String htmlContent = templateEngine.process("emailotp", context);

        helper.setTo(toEmail);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    private OrderResponse toResponse(Order order) {
        BigDecimal discountPrice = BigDecimal.ZERO;
        List<Course> courses = (order.getOrderDetails() != null)
                ? order.getOrderDetails().stream()
                        .filter(od -> od.getCourse() != null)
                        .map(od -> od.getCourse())
                        .toList()
                : List.of();

        BigDecimal total = courses.stream()
                .map(c -> c.getNewPrice() != null ? c.getNewPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (total.compareTo(BigDecimal.ZERO) == 0 && order.getTotalAmount() != null) {
            total = order.getTotalAmount();
        }

        if (order.getDiscountCode() != null && order.getDiscountCode().getDiscountPercent() != null) {
            discountPrice = total.multiply(order.getDiscountCode().getDiscountPercent()).divide(BigDecimal.valueOf(100));
        }

        return OrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus() != null ? order.getStatus().name() : "PENDING")
                .email(order.getEmail())
                .phone(order.getPhone())
                .description(order.getDescription())
                .totalAmount(total)
                .discountAmount(discountPrice)
                .finalAmount(order.getTotalAmount() != null ? order.getTotalAmount() : total.subtract(discountPrice))
                .discountCode(order.getDiscountCode() != null ? order.getDiscountCode().getCode() : null)
                .items((order.getOrderDetails() != null) ? order.getOrderDetails().stream().map(od ->
                        OrderDetailResponse.builder()
                                .id(od.getId())
                                .orderId(order.getId())
                                .courseId(od.getCourse() != null ? od.getCourse().getId() : -1L)
                                .courseName(od.getCourse() != null ? od.getCourse().getName() : "Trọn Bộ Full Khóa Học")
                                .coursePrice(od.getCourse() != null && od.getCourse().getNewPrice() != null ? od.getCourse().getNewPrice() : order.getTotalAmount())
                                .avatar(od.getCourse() != null && od.getCourse().getAvatar() != null ? CloudinaryUtils.optimize(od.getCourse().getAvatar()) : "/bn.png")
                                .totalPrice(od.getCourse() != null && od.getCourse().getNewPrice() != null ? od.getCourse().getNewPrice() : order.getTotalAmount())
                                .quantity(od.getQuantity() != null ? od.getQuantity() : 1)
                                .build()
                ).collect(Collectors.toList()) : List.of())
                .build();
    }
}

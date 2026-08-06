package com.example.khoahocdrive.service.Impl;

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
    public void sendEmail(String toEmail, String subject, Order order) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message,true);
        OrderResponse orderResponse = toResponse(order);
        List<Map<String, String>> courseLinks = order.getOrderDetails().stream()
                .map(detail -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("name", detail.getCourse().getName());
                    map.put("url", detail.getCourse().getLinkDrive());
                    return map;
                })
                .distinct()
                .collect(Collectors.toList());

        Context context = new Context();
        context.setVariable("name", orderResponse.getEmail()); // hoặc tên người dùng
        context.setVariable("orderId", orderResponse.getOrderId());
        context.setVariable("totalAmount", orderResponse.getTotalAmount());
        context.setVariable("discountAmount", orderResponse.getDiscountAmount());
        context.setVariable("finalAmount", orderResponse.getFinalAmount());
        context.setVariable("description", order.getDescription());
        context.setVariable("courseLinks", courseLinks);

        String htmlContent = templateEngine.process("email",context);

        helper.setTo(toEmail);
        helper.setCc("maivanhung0604@gmail.com");
        helper.setSubject(subject);
        helper.setText(htmlContent,true);
        mailSender.send(message);
    }

    @Override
    public void sendEmailOTP(String toEmail,String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message,true);
        Context context = new Context();
        context.setVariable("otp",otp);
        String htmlContent = templateEngine.process("emailotp",context);

        helper.setTo(toEmail);
        helper.setText(htmlContent,true);
        mailSender.send(message);
    }

    private OrderResponse toResponse(Order order) {
        BigDecimal discountPrice = BigDecimal.ZERO;
        List<Course> courses = order.getOrderDetails().stream().map(od->
                courseRepository.findById(od.getCourse().getId()).get()).toList();
        BigDecimal total = courses.stream().map(Course::getNewPrice).reduce(BigDecimal.ZERO,BigDecimal::add);
        if(order.getDiscountCode()!=null){
            discountPrice = total.multiply(order.getDiscountCode().getDiscountPercent()).divide(BigDecimal.valueOf(100));
        }
        return OrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus().name())
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
                                .courseId(od.getCourse().getId())
                                .courseName(od.getCourse().getName())
                                .coursePrice(od.getCourse().getNewPrice())
                                .avatar(CloudinaryUtils.optimize(od.getCourse().getAvatar()))
                                .totalPrice(BigDecimal.valueOf(od.getQuantity()).multiply(od.getCourse().getNewPrice()))
                                .quantity(od.getQuantity())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }
}

package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.OrderDetailRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.OrderDetailResponse;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.models.Course;
import com.example.khoahocdrive.models.Order;
import com.example.khoahocdrive.models.OrderDetail;
import com.example.khoahocdrive.repository.CourseRepository;
import com.example.khoahocdrive.repository.OrderDetailRepository;
import com.example.khoahocdrive.repository.OrderRepository;
import com.example.khoahocdrive.service.OrderDetailService;
import com.example.khoahocdrive.supports.enums.OrderStatus;
import com.example.khoahocdrive.supports.utils.CloudinaryUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class OrderDetailServiceImpl implements OrderDetailService {
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    @Override
    public ApiResponse<OrderDetailResponse> create(OrderDetailRequest request) {
        Order order = orderRepository.findById(request.getOrderId()).orElseThrow(
                ()-> new ResourceNotFoundException("Order not found")
        );
        if(!order.getStatus().equals(OrderStatus.PENDING)){
            throw new InvalidDataException("Cannot modify OrderDetail after payment.");
        }
        Course course = courseRepository.findById(request.getCourseId()).orElseThrow(
                ()-> new ResourceNotFoundException("Course not found")
        );
        OrderDetail orderDetail = OrderDetail.builder()
                .order(order)
                .course(course)
                .quantity(request.getQuantity())
                .build();
        orderDetailRepository.save(orderDetail);
        return ApiResponse.<OrderDetailResponse>builder()
                .message("Create OrderDetail")
                .data(toResponse(orderDetail))
                .build();
    }

    @Override
    public ApiResponse<List<OrderDetailResponse>> getByOrderId(Long orderId) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(orderId);
        List<OrderDetailResponse> orderDetailResponses = orderDetails.stream().map(this::toResponse).toList();
        return ApiResponse.<List<OrderDetailResponse>>builder()
                .data(orderDetailResponses)
                .message("Get OrderDetail By Order Id")
                .build();
    }

    @Override
    public ApiResponse<OrderDetailResponse> getOrderDetailById(Long id) {
        OrderDetail orderDetail = orderDetailRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Order Detail not found")
        );

        return ApiResponse.<OrderDetailResponse>builder()
                .message("Get Order Detail By Id")
                .data(toResponse(orderDetail))
                .build();
    }

    private OrderDetailResponse toResponse(OrderDetail detail){
        return OrderDetailResponse.builder()
                .courseId(detail.getCourse().getId())
                .quantity(detail.getQuantity())
                .orderId(detail.getOrder().getId())
                .avatar(CloudinaryUtils.optimize(detail.getCourse().getAvatar()))
                .courseName(detail.getCourse().getName())
                .coursePrice(detail.getCourse().getNewPrice())
                .build();
    }
}

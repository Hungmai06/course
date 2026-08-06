package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.config.OpenApiConfig;
import com.example.khoahocdrive.dto.request.CartItemRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CartItemResponse;
import com.example.khoahocdrive.dto.response.CartResponse;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.models.Cart;
import com.example.khoahocdrive.models.CartItem;
import com.example.khoahocdrive.models.Course;
import com.example.khoahocdrive.models.User;
import com.example.khoahocdrive.repository.CartItemRepository;
import com.example.khoahocdrive.repository.CartRepository;
import com.example.khoahocdrive.repository.CourseRepository;
import com.example.khoahocdrive.repository.UserRepository;
import com.example.khoahocdrive.service.CartService;
import com.example.khoahocdrive.supports.utils.CloudinaryUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    @Override
    @Transactional
    public ApiResponse<CartResponse> getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(
                ()-> new ResourceNotFoundException("Cart Not Found")
        );
        List<CartItemResponse> items = cart.getCartItems().stream().map(
                item-> CartItemResponse.builder()
                        .name(item.getCourse().getName())
                        .price(item.getCourse().getNewPrice())
                        .quantity(item.getQuantity())
                        .avatar(CloudinaryUtils.optimize(item.getCourse().getAvatar()))
                        .courseId(item.getCourse().getId())
                        .build()
        ).collect(Collectors.toList());

        double total = items.stream().mapToDouble(i->i.getPrice().doubleValue()*i.getQuantity()).sum();

        CartResponse cartResponse = CartResponse.builder()
                .items(items)
                .totalPrice(total)
                .userId(userId)
                .build();
        return ApiResponse.<CartResponse>builder()
                .message("Get cart")
                .data(cartResponse)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<CartItemResponse> addCart(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Ensure cart exists
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });

        // Ensure course exists
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Find CartItem in this user's cart
        Optional<CartItem> optionalCartItem =
                cartItemRepository.findByCartIdAndCourseId(cart.getId(), course.getId());

        CartItem cartItem;

        if (optionalCartItem.isPresent()) {
            cartItem = optionalCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                    .course(course)
                    .quantity(request.getQuantity())
                    .cart(cart)
                    .build();
        }

        cartItemRepository.save(cartItem);

        CartItemResponse cartItemResponse = CartItemResponse.builder()
                .courseId(course.getId())
                .avatar(CloudinaryUtils.optimize(course.getAvatar()))
                .quantity(cartItem.getQuantity())
                .price(course.getNewPrice())
                .name(course.getName())
                .build();

        return ApiResponse.<CartItemResponse>builder()
                .message("Add course To Cart")
                .data(cartItemResponse)
                .build();
    }


    @Override
    @Transactional
    public ApiResponse<CartItemResponse> update(Long userId, Long productId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem cartItem = cartItemRepository.findByCartIdAndCourseId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart Item not found"));

        cartItem.setQuantity(cartItem.getQuantity() + quantity);
        cartItemRepository.save(cartItem);

        CartItemResponse response = CartItemResponse.builder()
                .courseId(cartItem.getCourse().getId())
                .avatar(CloudinaryUtils.optimize(cartItem.getCourse().getAvatar()))
                .quantity(cartItem.getQuantity())
                .price(cartItem.getCourse().getNewPrice())
                .name(cartItem.getCourse().getName())
                .build();

        return ApiResponse.<CartItemResponse>builder()
                .message("Updated cart item")
                .data(response)
                .build();
    }

    @Override
    public void deleteItemForCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(
                () -> new ResourceNotFoundException("Cart not found")
        );

        CartItem cartItem = cartItemRepository.findByCartIdAndCourseId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        cartItemRepository.delete(cartItem);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(
                ()-> new ResourceNotFoundException("Cart Not found")
        );
        cart.getCartItems().clear();
        cartRepository.save(cart);

    }
}

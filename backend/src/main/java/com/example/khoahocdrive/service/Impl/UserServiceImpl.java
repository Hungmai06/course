package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.UserCreateRequest;
import com.example.khoahocdrive.dto.request.UserUpdateRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.dto.response.UserResponse;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.mapper.UserMapper;
import com.example.khoahocdrive.models.Cart;
import com.example.khoahocdrive.models.Role;
import com.example.khoahocdrive.models.User;
import com.example.khoahocdrive.repository.CartRepository;
import com.example.khoahocdrive.repository.RoleRepository;
import com.example.khoahocdrive.repository.UserRepository;
import com.example.khoahocdrive.service.UserService;
import com.example.khoahocdrive.supports.utils.PaginationUtil;
import com.example.khoahocdrive.supports.utils.PasswordUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordUtil passwordUtil;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PaginationUtil paginationUtil;
    private final CartRepository cartRepository;
    @Override
    public ApiResponse<UserResponse> createUser(UserCreateRequest request) throws Exception {
        if(userRepository.findByUsername(request.getUsername()).isPresent()){
            throw new InvalidDataException("UserName existed");
        }
        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new InvalidDataException("Email existed");
        }

        Role role = roleRepository.findById(2L).orElseThrow(
                ()->  new ResourceNotFoundException("Role not found")
        );
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordUtil.encodePassword(request.getPassword()))
                .email(request.getEmail())
                .role(role)
                .build();
        if(request.getVip()!= null || !request.getVip().equals("")){
            user.setVip(request.getVip());
        }
        userRepository.save(user);
        Cart cart = new Cart();
        cart.setUser(user);
        cartRepository.save(cart);
        return ApiResponse.<UserResponse>builder()
                .message("Create user successfully!")
                .data(userMapper.toResponse(user))
                .build();
    }

    @Override
    public ApiResponse<PagedResponse<UserResponse>> getAll(int page,int size) {

        Pageable pageable = PageRequest.of(page,size);
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserResponse> userResponses = userPage.getContent()
                .stream()
                .map(userMapper::toResponse)
                .toList();
        PagedResponse<UserResponse> pagedResponse = PagedResponse.<UserResponse>builder()
                .content(userResponses)
                .pageNumber(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .build();
        return ApiResponse.<PagedResponse<UserResponse>>builder()
                .message("Get all User")
                .data(pagedResponse)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<UserResponse> updateUser(Long id,UserUpdateRequest request) throws Exception {
        User user = userRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Người dùng không tồn tại")
        );
        Optional<User> user1 = userRepository.findByUsername(request.getUsername());
        if(user1.isPresent() && !user1.get().getId().equals(user.getId())){
            throw new InvalidDataException("Tên đăng nhập đã tồn tại");
        }
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        if(request.getPassword() != null && !request.getPassword().trim().isEmpty()){
            user.setPassword(passwordUtil.encodePassword(request.getPassword()));
        }
        user.setVip(request.getVip());
        userRepository.save(user);
        return ApiResponse.<UserResponse>builder()
                .message("Update user")
                .data(userMapper.toResponse(user))
                .build();
    }

    @Override
    public ApiResponse<UserResponse> findUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("User not found")
        );
        return ApiResponse.<UserResponse>builder()
                .message("Find By User with id = "+id)
                .data(userMapper.toResponse(user))
                .build();
    }

    @Override
    public ApiResponse<PagedResponse<UserResponse>> findUserCredential(String credential) {
        List<User> users = userRepository.findUserByCredential(credential);
        Pageable pageable = PageRequest.of(0,10);
        Page<User> userPage = paginationUtil.toPage(users,pageable);
        List<UserResponse> userResponses = userPage.stream().map(userMapper::toResponse).toList();

        PagedResponse<UserResponse> pagedResponse= PagedResponse.<UserResponse>builder()
                .totalPages(userPage.getTotalPages())
                .totalElements(userPage.getTotalElements())
                .pageSize(10)
                .pageNumber(0)
                .content(userResponses)
                .build();
        return ApiResponse.<PagedResponse<UserResponse>>builder()
                .message("Look for user information")
                .data(pagedResponse)
                .build();
    }

    @Override
    public void deleteUser(Long id) {
      userRepository.delete(userRepository.findById(id).orElseThrow(
              ()-> new ResourceNotFoundException(("User not found"))
      ));
    }
}

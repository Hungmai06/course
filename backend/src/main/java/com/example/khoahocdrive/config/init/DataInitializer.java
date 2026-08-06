package com.example.khoahocdrive.config.init;

import com.example.khoahocdrive.models.Role;
import com.example.khoahocdrive.models.User;
import com.example.khoahocdrive.repository.RoleRepository;
import com.example.khoahocdrive.repository.UserRepository;
import com.example.khoahocdrive.supports.utils.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordUtil passwordUtil;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {

        String email = "maivanhung0604@gmail.com";
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            return;
        }

        Role role = roleRepository.findByName("ADMIN")
                .orElseGet(() -> {
                    return roleRepository.save(Role.builder()
                            .name("ADMIN")
                            .description("Quyền quản trị hệ thống")
                            .build());
                });
            Role role1 = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    return roleRepository.save(Role.builder()
                            .name("USER")
                            .description("Người dùng hệ thống")
                            .build());
                });
        User admin = User.builder()
                .email("maivanhung0604@gmail.com")
                .username("Hungmai06042003")
                .password(passwordUtil.encodePassword("Hungmai06042003@"))
                .role(role)
                .build();

        userRepository.save(admin);
    }
}

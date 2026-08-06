package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.ResetPasswordRequest;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.models.User;
import com.example.khoahocdrive.repository.UserRepository;
import com.example.khoahocdrive.service.EmailService;
import com.example.khoahocdrive.supports.utils.PasswordUtil;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForgotPassword implements com.example.khoahocdrive.service.ForgotPassword {
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PasswordUtil passwordUtil;

    @Override
    public void sendNewPassword(String username) throws MessagingException {
        User user = userRepository.findByUsername(username).orElseThrow(
                ()-> new ResourceNotFoundException("User không tồn tài")
        );
        String newPassword = UUID.randomUUID().toString().replace("-","").substring(0,7);
        user.setPassword(passwordUtil.encodePassword(newPassword));
        userRepository.save(user);
        emailService.sendEmailOTP(user.getEmail(),newPassword);
    }

    @Override
    public void handleResetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow(
                ()-> new ResourceNotFoundException("User không tồn tài")
        );
        if(passwordUtil.matches(request.getNewPassword(), user.getPassword())){
            user.setPassword(passwordUtil.encodePassword(request.getPasswordReset()));
            userRepository.save(user);
        }
    }
}

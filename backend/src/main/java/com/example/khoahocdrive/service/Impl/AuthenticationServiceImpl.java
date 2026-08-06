package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.RefreshTokenRequest;
import com.example.khoahocdrive.dto.request.SignInRequest;
import com.example.khoahocdrive.dto.response.TokenResponse;
import com.example.khoahocdrive.dto.response.UserResponse;
import com.example.khoahocdrive.exceptions.ForBiddenException;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.mapper.UserMapper;
import com.example.khoahocdrive.models.Role;
import com.example.khoahocdrive.models.User;
import com.example.khoahocdrive.repository.RoleRepository;
import com.example.khoahocdrive.repository.UserRepository;
import com.example.khoahocdrive.service.AuthenticationService;
import com.example.khoahocdrive.service.JwtService;
import com.example.khoahocdrive.supports.enums.TokenType;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.neo4j.Neo4jProperties;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    @Override
    public TokenResponse getAccessToken(SignInRequest request) {
       try {
           Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(),request.getPassword()));
           SecurityContextHolder.getContext().setAuthentication(authentication);
       }catch (AccessDeniedException e){
           throw new AccessDeniedException(e.getMessage());
       }
        var user = userRepository.findByUsername(request.getUsername()).get();
       if(user == null){
           throw new ResourceNotFoundException("User not found");
       }
        Role role = roleRepository.findById(user.getRole().getId()).orElseThrow(
                ()->new ResourceNotFoundException("Role not found")
        );
        UserResponse userResponse = userMapper.toResponse(user);
        String accessToken = jwtService.generateAccessToken(user.getId(),request.getUsername(),user.getAuthorities());
        String refreshToken = jwtService.generateRefreshToken(user.getId(),request.getUsername(),user.getAuthorities());
        return TokenResponse.builder()
                .refreshToken(refreshToken)
                .accessToken(accessToken)
                .roleName(role.getName())
                .userResponse(userResponse)
                .build();
    }

    @Override
    public TokenResponse getRefreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if(!StringUtils.hasLength(refreshToken)){
            throw new InvalidDataException("Token must be not blank ");
        }
        try {
            String username = jwtService.extractUsername(refreshToken, TokenType.REFRESH_TOKEN);
            User user = userRepository.findByUsername(username).orElseThrow(
                    ()-> new ResourceNotFoundException("User not found")
            );
            Role role = roleRepository.findById(user.getRole().getId()).orElseThrow(
                    ()->new ResourceNotFoundException("Role not found")
            );
            UserResponse userResponse = userMapper.toResponse(user);
            String accessToken = jwtService.generateAccessToken(user.getId(),user.getUsername(),user.getAuthorities());
            return TokenResponse.builder()
                    .refreshToken(refreshToken)
                    .accessToken(accessToken)
                    .roleName(role.getName())
                    .userResponse(userResponse)
                    .build();
        }catch (Exception e){
            throw new ForBiddenException(e.getMessage());
        }
    }
}

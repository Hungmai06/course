package com.example.khoahocdrive.mapper;

import com.example.khoahocdrive.dto.response.UserResponse;
import com.example.khoahocdrive.models.User;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface UserMapper {

     UserResponse toResponse(User user);

}
package com.example.khoahocdrive.mapper;

import com.example.khoahocdrive.dto.response.AuthorResponse;
import com.example.khoahocdrive.models.Author;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface AuthorMapper {
    AuthorResponse toResponse(Author author);
}

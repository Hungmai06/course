package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.AuthorRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.AuthorResponse;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.mapper.AuthorMapper;
import com.example.khoahocdrive.models.Author;
import com.example.khoahocdrive.repository.AuthorRepository;
import com.example.khoahocdrive.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService {
    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;
    @Override
    public ApiResponse<AuthorResponse> findAuthorById(Long id) {
        Author author = authorRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Author not found")
        );
        return ApiResponse.<AuthorResponse>builder()
                .message("Find Author By Id")
                .data(authorMapper.toResponse(author))
                .build();
    }

    @Override
    public ApiResponse<AuthorResponse> create(AuthorRequest request) {
        if(authorRepository.findAuthorByName(request.getName()).isPresent()){
            throw new InvalidDataException("Author Existed");
        }
        Author author = Author.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        authorRepository.save(author);
        return ApiResponse.<AuthorResponse>builder()
                .data(authorMapper.toResponse(author))
                .message("Create Author Successfully")
                .build();
    }

    @Override
    public ApiResponse<AuthorResponse> update(Long id, AuthorRequest request) {
        Author author = authorRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Author not found")
        );
        author.setDescription(request.getDescription());
        author.setName(request.getName());
        authorRepository.save(author);
        return ApiResponse.<AuthorResponse>builder()
                .message("Update Author")
                .data(authorMapper.toResponse(author))
                .build();
    }

    @Override
    public ApiResponse<List<AuthorResponse>> getAll() {
        List<Author> authors = authorRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        List<AuthorResponse> authorResponses = authors.stream()
                .map(authorMapper::toResponse)
                .toList();

        return ApiResponse.<List<AuthorResponse>>builder()
                .message("Get all Author")
                .data(authorResponses)
                .build();

    }

    @Override
    public void delete(Long id) {
        authorRepository.deleteById(id);
    }
}

package com.example.khoahocdrive.exceptions;

import lombok.Getter;

@Getter
public class InvalidDataException extends RuntimeException{
    public InvalidDataException(String message) {
        super(message);
    }
}

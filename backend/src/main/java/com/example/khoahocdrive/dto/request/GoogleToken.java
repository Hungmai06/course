package com.example.khoahocdrive.dto.request;


import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleToken {
    private String access_token;
    private Integer expires_in;
    private String scope;
    private String token_type;
    private String id_token;
    private String refresh_token;
    private Long obtained_at; // epoch seconds (thời điểm lấy token)
}
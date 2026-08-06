package com.example.khoahocdrive.english48ngay.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DLChatMessageResponse {
    private Long id;
    private String sender;
    private String senderEmail;
    private String avatar;
    private String text;
    private String time;
    private Boolean isAdmin;
}

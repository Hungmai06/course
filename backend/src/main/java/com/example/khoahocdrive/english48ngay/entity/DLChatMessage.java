package com.example.khoahocdrive.english48ngay.entity;

import com.example.khoahocdrive.models.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dl_chat_messages")
public class DLChatMessage extends AbstractEntity {

    @Column(name = "sender", nullable = false)
    private String sender;

    @Column(name = "sender_email", nullable = false)
    private String senderEmail;

    @Column(name = "avatar", nullable = false)
    private String avatar;

    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "is_admin")
    @Builder.Default
    private Boolean isAdmin = false;
}

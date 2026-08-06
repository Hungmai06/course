package com.example.khoahocdrive.service;

import com.example.khoahocdrive.config.GoogleServiceAccountProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.*;
import com.google.api.client.http.json.JsonHttpContent;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleDriveService {

    private final GoogleServiceAccountProperties properties;

    public void grantPermissionViaHttp(String fileUrl, String userEmail) {
        try {
            String fileId = extractFileIdFromUrl(fileUrl);

            if (fileId == null) {
                throw new IllegalArgumentException("❌ Không thể tách fileId từ URL: " + fileUrl);
            }

            // Convert YAML config → JSON string
            Map<String, Object> jsonMap = properties.toMap();
            String json = new ObjectMapper().writeValueAsString(jsonMap);

            // Chọn scope từ YAML hoặc fallback về scope mặc định
            List<String> scopes = (properties.getScopes() != null && !properties.getScopes().isEmpty())
                    ? properties.getScopes()
                    : Collections.singletonList("https://www.googleapis.com/auth/drive");

            log.info("🔑 Scopes đang sử dụng: {}", scopes);

            // Load credentials
            GoogleCredentials credentials = GoogleCredentials
                    .fromStream(new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8)))
                    .createScoped(scopes);

            credentials.refreshIfExpired();

            // Build HTTP request factory
            HttpRequestFactory requestFactory = GoogleNetHttpTransport.newTrustedTransport()
                    .createRequestFactory(new HttpCredentialsAdapter(credentials));

            // Body request cấp quyền
            Map<String, String> permission = new HashMap<>();
            permission.put("type", "user");     // cấp cho user cụ thể
            permission.put("role", "reader");   // quyền đọc
            permission.put("emailAddress", userEmail);

            // API endpoint
            GenericUrl url = new GenericUrl(
                    "https://www.googleapis.com/drive/v3/files/" + fileId + "/permissions"
                            + "?supportsAllDrives=true&sendNotificationEmail=false"
            );

            JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
            HttpContent content = new JsonHttpContent(jsonFactory, permission);

            HttpRequest request = requestFactory.buildPostRequest(url, content);
            request.getHeaders().setContentType("application/json");

            HttpResponse response = request.execute();

            int status = response.getStatusCode();
            String body = response.parseAsString();

            if (status == 200 || status == 201) {
                log.info("✅ Đã cấp quyền 'reader' cho {} (fileId={})", userEmail, fileId);
            } else {
                log.error("❌ Lỗi khi cấp quyền cho {}: status={} body={}", userEmail, status, body);
            }

        } catch (Exception e) {
            log.error("❌ Exception khi cấp quyền cho {}: {}", userEmail, e.getMessage(), e);
        }
    }

    private String extractFileIdFromUrl(String url) {
        if (url == null) return null;
        // Hỗ trợ cả file (/d/), folder (/folders/), và ?id=xxx
        String regex = "(?<=/d/|/folders/|id=)([a-zA-Z0-9_-]{10,})";
        var matcher = java.util.regex.Pattern.compile(regex).matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}

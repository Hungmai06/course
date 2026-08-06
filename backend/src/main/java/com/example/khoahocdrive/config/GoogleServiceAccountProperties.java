package com.example.khoahocdrive.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "google.service-account")
public class GoogleServiceAccountProperties {

    private String type;
    private String project_id;
    private String private_key_id;
    private String private_key;
    private String client_email;
    private String client_id;
    private String auth_uri;
    private String token_uri;
    private String auth_provider_x509_cert_url;
    private String client_x509_cert_url;
    private String universe_domain;
    private List<String> scopes;

    public Map<String, Object> toMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("type", type);
        map.put("project_id", project_id);
        map.put("private_key_id", private_key_id);
        map.put("private_key", private_key);
        map.put("client_email", client_email);
        map.put("client_id", client_id);
        map.put("auth_uri", auth_uri);
        map.put("token_uri", token_uri);
        map.put("auth_provider_x509_cert_url", auth_provider_x509_cert_url);
        map.put("client_x509_cert_url", client_x509_cert_url);
        map.put("universe_domain", universe_domain);
        return map;
    }
}

package com.example.khoahocdrive.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${openapi.service.api-docs:backend-service}")
    private String apiDocs;

    @Value("${openapi.service.title:Backend Service API}")
    private String title;

    @Value("${openapi.service.version:1.0.0}")
    private String version;

    @Value("${openapi.service.server:http://localhost:8081}")
    private String serverUrl;

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group(apiDocs)
                .packagesToScan("com.example.khoahocdrive.controller")
                .build();
    }

    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .servers(List.of(new Server().url(serverUrl)))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .security(List.of(new SecurityRequirement().addList(securitySchemeName)))
                .info(new Info()
                        .title(title)
                        .description("API documents for Backend service")
                        .version(version)
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")));
    }
}

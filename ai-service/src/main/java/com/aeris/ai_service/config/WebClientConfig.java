package com.aeris.ai_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${grok.api.url}")
    private String grokApiUrl;

    @Value("${grok.api.key}")
    private String grokApiKey;

    @Bean
    public WebClient grokWebClient() {
        return WebClient.builder()
                .baseUrl(grokApiUrl)
                .defaultHeader("Authorization", "Bearer " + grokApiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
package com.aeris.ai_service.service;

import com.aeris.ai_service.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final WebClient grokWebClient;

    @Value("${grok.model}")
    private String model;

    private static final String SYSTEM_PROMPT =
        "Tu es AERIS, un assistant intelligent spécialisé dans la qualité de l'air au Sénégal. " +
        "Tu aides les utilisateurs à comprendre les données de pollution (CO2, CO, NH3, N2, SO2) " +
        "des zones de Diamniadio, Bargny et Sébikotane. " +
        "Tu réponds aussi aux questions générales de culture scientifique et environnementale. " +
        "Réponds toujours en français, de manière claire et pédagogique.";

    public AiService(WebClient grokWebClient) {
        this.grokWebClient = grokWebClient;
    }

    public ChatResponse chat(String userMessage) {
        Map<String, Object> requestBody = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", userMessage)
            )
        );

        Map<?, ?> response = grokWebClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        String reply = extractReply(response);
        return new ChatResponse(reply, model);
    }

    @SuppressWarnings("unchecked")
    private String extractReply(Map<?, ?> response) {
        try {
            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "Désolé, une erreur est survenue lors de la communication avec l'IA.";
        }
    }
}
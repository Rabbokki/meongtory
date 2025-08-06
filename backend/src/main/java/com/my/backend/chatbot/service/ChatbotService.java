package com.my.backend.chatbot.service;

import com.my.backend.chatbot.dto.ChatbotRequest;
import com.my.backend.chatbot.dto.ChatbotResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ChatbotService {
    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public ChatbotService(RestTemplate restTemplate, @Value("${AI_SERVICE_URL}") String aiServiceUrl) {
        this.restTemplate = restTemplate;
        this.aiServiceUrl = aiServiceUrl;
    }

    public ChatbotResponse queryAI(ChatbotRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<ChatbotRequest> entity = new HttpEntity<>(request, headers);
        return restTemplate.postForObject(aiServiceUrl + "/rag", entity, ChatbotResponse.class);
    }
}
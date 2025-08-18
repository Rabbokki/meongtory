package com.my.backend.chatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.backend.chatbot.dto.ChatbotRequest;
import com.my.backend.chatbot.dto.ChatbotResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;


@Service
public class ChatbotService {

    private final RestTemplate restTemplate;

    public ChatbotService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ChatbotResponse queryAI(ChatbotRequest request) {
        try {
            String aiServiceUrl = "http://ai:9000/chatbot";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON, MediaType.APPLICATION_JSON_UTF8));
            HttpEntity<ChatbotRequest> entity = new HttpEntity<>(request, headers);

            System.out.println("Sending request to AI service: " + aiServiceUrl + " with query: " + request.getQuery());

            ResponseEntity<String> rawResponse = restTemplate.exchange(
                    aiServiceUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            System.out.println("Raw AI service response: " + rawResponse.getBody());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(rawResponse.getBody());
            String answer = jsonNode.get("answer").asText();

            ChatbotResponse response = new ChatbotResponse(answer);
            System.out.println("Parsed response from AI service: " + response.getAnswer());
            return response;
        } catch (Exception e) {
            System.err.println("Error in AI service request: " + e.getMessage());
            e.printStackTrace();
            return new ChatbotResponse("챗봇 요청 처리 중 오류 발생: " + e.getMessage());
        }
    }
}
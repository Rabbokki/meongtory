package com.my.backend.chatbot.service;

import com.my.backend.chatbot.dto.ChatbotRequest;
import com.my.backend.chatbot.dto.ChatbotResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

//@Service
//public class ChatbotService {
//    private final RestTemplate restTemplate;
//    private final String aiServiceUrl;
//
//    public ChatbotService(RestTemplate restTemplate, @Value("${AI_SERVICE_URL}") String aiServiceUrl) {
//        this.restTemplate = restTemplate;
//        this.aiServiceUrl = aiServiceUrl;
//    }
//
//    public ChatbotResponse queryAI(ChatbotRequest request) {
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        HttpEntity<ChatbotRequest> entity = new HttpEntity<>(request, headers);
//        return restTemplate.postForObject(aiServiceUrl + "/rag", entity, ChatbotResponse.class);
//    }
//}

@Service
public class ChatbotService {

    private final RestTemplate restTemplate;

    public ChatbotService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ChatbotResponse queryAI(ChatbotRequest request) {
        try {
            String aiServiceUrl = "http://ai:9000/rag";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ChatbotRequest> entity = new HttpEntity<>(request, headers);

            System.out.println("Sending request to AI service: " + aiServiceUrl + " with query: " + request.getQuery());
            ChatbotResponse response = restTemplate.postForObject(aiServiceUrl, entity, ChatbotResponse.class);

            if (response == null || response.getAnswer() == null) {
                System.out.println("Received null or empty response from AI service");
                return new ChatbotResponse("AI 서비스로부터 응답이 없습니다.");
            }

            System.out.println("Received response from AI service: " + response.getAnswer());
            return response;
        } catch (Exception e) {
            System.err.println("Error in AI service request: " + e.getMessage());
            e.printStackTrace();
            return new ChatbotResponse("챗봇 요청 처리 중 오류 발생: " + e.getMessage());
        }
    }
}
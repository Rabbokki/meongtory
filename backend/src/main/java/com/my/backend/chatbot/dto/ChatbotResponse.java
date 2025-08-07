package com.my.backend.chatbot.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatbotResponse {
    private String answer;

    public ChatbotResponse(String answer) {
        this.answer = answer;
    }
}
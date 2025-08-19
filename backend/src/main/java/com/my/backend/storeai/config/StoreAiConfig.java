package com.my.backend.storeai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class StoreAiConfig {
    
    @Bean
    public RestTemplate storeAiRestTemplate() {
        return new RestTemplate();
    }
}


package com.my.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        // Dotenv 인스턴스를 생성하고 `.env` 파일을 로드
        Dotenv dotenv = Dotenv.load();

        // 로드된 환경 변수들을 시스템 속성으로 설정
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });

        // 스프링 애플리케이션 실행
        SpringApplication.run(BackendApplication.class, args);
    }

}

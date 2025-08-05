package com.my.backend;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;



@SpringBootApplication
@EnableJpaAuditing
@EnableTransactionManagement
@EnableCaching
public class BackendApplication {
    public static void main(String[] args) {
        System.out.println("SPRING_DATASOURCE_URL: " + System.getenv("SPRING_DATASOURCE_URL"));
        System.out.println("SPRING_DATASOURCE_USERNAME: " + System.getenv("SPRING_DATASOURCE_USERNAME"));
        System.out.println("SPRING_DATASOURCE_PASSWORD: " + System.getenv("SPRING_DATASOURCE_PASSWORD"));
        System.out.println("SERVER_PORT: " + System.getenv("SERVER_PORT"));
        System.out.println("JWT_SECRET_KEY: " + System.getenv("JWT_SECRET_KEY"));
        SpringApplication.run(BackendApplication.class, args);
    }
}
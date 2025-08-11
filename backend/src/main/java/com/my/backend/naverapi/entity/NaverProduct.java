package com.my.backend.naverapi.entity;



import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "naver_product")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NaverProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String link;
    private String image;
    private int lprice;
    private int hprice;
    private String mallName;
}

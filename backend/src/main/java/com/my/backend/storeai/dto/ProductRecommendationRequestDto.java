package com.my.backend.storeai.dto;

import com.my.backend.storeai.enums.RecommendationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendationRequestDto {
    private Long myPetId;          // 선택된 펫 ID (선택사항)
    @Builder.Default
    private RecommendationType recommendationType = RecommendationType.SIMILAR;
    @Builder.Default
    private Integer limit = 5;     // 추천 개수
}

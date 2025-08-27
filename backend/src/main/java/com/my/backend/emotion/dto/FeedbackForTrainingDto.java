package com.my.backend.emotion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackForTrainingDto {
    
    private List<TrainingDataItem> positiveFeedback; // 올바른 예측들
    
    private List<TrainingDataItem> negativeFeedback; // 틀린 예측들
    
    private Integer totalCount; // 전체 데이터 개수
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainingDataItem {
        private String imageUrl;
        private String correctEmotion; // 학습에 사용할 올바른 라벨
        private Float originalConfidence; // 원래 예측 신뢰도
    }
}
package com.my.backend.emotion.entity;

import com.my.backend.account.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "emotion_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmotionFeedback extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long id;
    
    @Column(nullable = false, length = 500)
    private String imageUrl;
    
    @Column(nullable = false, length = 50)
    private String predictedEmotion;
    
    @Column(nullable = true, length = 50)
    private String correctEmotion; // 부정 피드백 시에만 사용
    
    @Column(nullable = false)
    private Boolean isCorrectPrediction; // true: 예, false: 아니오
    
    @Column(nullable = false)
    private Float predictionConfidence; // 모델의 원래 신뢰도
    
    @Column(nullable = false)
    private Boolean isUsedForTraining = false; // 학습에 사용되었는지 여부
    
}
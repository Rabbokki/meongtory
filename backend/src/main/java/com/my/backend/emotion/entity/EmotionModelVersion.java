package com.my.backend.emotion.entity;

import com.my.backend.account.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

// 감정 분석 모델 버전 관리 엔티티
@Entity
@Table(name = "emotion_model_version")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmotionModelVersion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 모델 버전 (예: v1.0.0, v1.0.1)
    @Column(nullable = false, unique = true, length = 50)
    private String version;

    // 모델 파일 경로 (상대 경로)
    @Column(nullable = false, length = 500)
    private String modelPath;

    // 백업 파일 경로
    @Column(length = 500)
    private String backupPath;

    // 모델 설명
    @Column(columnDefinition = "TEXT")
    private String description;

    // 학습에 사용된 피드백 샘플 수
    @Column(nullable = false)
    @ColumnDefault("0")
    private Integer feedbackSampleCount = 0;

    // 학습률
    @Column
    private Double learningRate;

    // 학습 에포크 수
    private Integer numEpochs;

    // 최종 학습 정확도
    @Column
    private Double finalAccuracy;

    // 최종 학습 손실값
    @Column
    private Double finalLoss;

    // 검증 정확도 (별도 검증 세트 평가 결과)
    @Column
    private Double validationAccuracy;

    // F1 스코어
    @Column
    private Double f1Score;

    // 현재 활성 모델 여부
    @Column(nullable = false)
    @ColumnDefault("false")
    private Boolean isActive = false;

    // 모델 상태 (TRAINING, READY, DEPRECATED, ERROR)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @ColumnDefault("'READY'")
    private ModelStatus status = ModelStatus.READY;

    // 학습 완료 시간
    @Column
    private LocalDateTime trainedAt;

    // 성능 평가 상세 정보 (JSON 형태)
    @Column(columnDefinition = "TEXT")
    private String performanceMetrics;

    // 학습 히스토리 정보 (JSON 형태)
    @Column(columnDefinition = "TEXT")
    private String trainingHistory;

    // 에러 메시지 (실패한 경우)
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    public enum ModelStatus {
        TRAINING("학습중"),
        READY("준비완료"),
        DEPRECATED("사용중지"),
        ERROR("에러");

        private final String korean;

        ModelStatus(String korean) {
            this.korean = korean;
        }

        public String getKorean() {
            return korean;
        }
    }

    // 활성 모델로 설정
    public void activate() {
        this.isActive = true;
        this.status = ModelStatus.READY;
    }

    // 비활성화
    public void deactivate() {
        this.isActive = false;
    }

    // 사용 중지로 설정
    public void deprecate() {
        this.isActive = false;
        this.status = ModelStatus.DEPRECATED;
    }

    // 에러 상태로 설정
    public void markAsError(String errorMessage) {
        this.isActive = false;
        this.status = ModelStatus.ERROR;
        this.errorMessage = errorMessage;
    }
}
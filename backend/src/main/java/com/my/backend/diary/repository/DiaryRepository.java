package com.my.backend.diary.repository;

import com.my.backend.account.entity.Account;
import com.my.backend.diary.entity.Diary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DiaryRepository extends JpaRepository<Diary, Long> {
    List<Diary> findByUser(Account user);
    List<Diary> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(Account user);
    List<Diary> findByIsDeletedFalseOrderByCreatedAtDesc();
    
    // 페이징 지원 메서드들 추가
    Page<Diary> findByUserAndIsDeletedFalse(Account user, Pageable pageable);
    Page<Diary> findByIsDeletedFalse(Pageable pageable);
    
    @Query(value = "SELECT * FROM diary d WHERE :category = ANY(d.categories) AND d.is_deleted = false ORDER BY d.created_at DESC", nativeQuery = true)
    List<Diary> findByCategory(@Param("category") String category);
    
    @Query(value = "SELECT * FROM diary d WHERE :category = ANY(d.categories) AND d.user_id = :userId AND d.is_deleted = false ORDER BY d.created_at DESC", nativeQuery = true)
    List<Diary> findByCategoryAndUser(@Param("category") String category, @Param("userId") Long userId);
    
    // 페이징 지원 카테고리 조회 메서드들 추가
    @Query(value = "SELECT * FROM diary d WHERE :category = ANY(d.categories) AND d.is_deleted = false", nativeQuery = true)
    Page<Diary> findByCategoryWithPaging(@Param("category") String category, Pageable pageable);
    
    @Query(value = "SELECT * FROM diary d WHERE :category = ANY(d.categories) AND d.user_id = :userId AND d.is_deleted = false", nativeQuery = true)
    Page<Diary> findByCategoryAndUserWithPaging(@Param("category") String category, @Param("userId") Long userId, Pageable pageable);
    
    // 날짜별 조회 메서드들 추가
    @Query("SELECT d FROM Diary d WHERE d.createdAt >= :startOfDay AND d.createdAt < :endOfDay AND d.isDeleted = false")
    Page<Diary> findByCreatedAtBetween(Pageable pageable, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
    
    @Query("SELECT d FROM Diary d WHERE d.user = :user AND d.createdAt >= :startOfDay AND d.createdAt < :endOfDay AND d.isDeleted = false")
    Page<Diary> findByUserAndCreatedAtBetween(Pageable pageable, @Param("user") Account user, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
    
    // MyPet과 연관된 다이어리 삭제
    @Modifying
    @Query("DELETE FROM Diary d WHERE d.pet.myPetId = :myPetId")
    int deleteByMyPetId(@Param("myPetId") Long myPetId);
    
    // 최근 5초 이내에 동일한 사용자가 동일한 제목과 내용으로 작성한 일기가 있는지 확인
    @Query("SELECT COUNT(d) > 0 FROM Diary d WHERE d.user.id = :userId AND d.title = :title AND d.text = :text AND d.createdAt >= :fiveSecondsAgo")
    boolean existsByUserIdAndTitleAndTextAndCreatedAtAfter(@Param("userId") Long userId, @Param("title") String title, @Param("text") String text, @Param("fiveSecondsAgo") LocalDateTime fiveSecondsAgo);
    
    // 같은 userId가 최근에 동일한 title+text로 작성한 일기를 찾는 메서드
    Optional<Diary> findTopByUserIdAndTitleAndTextOrderByCreatedAtDesc(
        Long userId, String title, String text
    );
}

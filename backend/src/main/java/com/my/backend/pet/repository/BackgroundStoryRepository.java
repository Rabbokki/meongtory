package com.my.backend.pet.repository;

import com.my.backend.pet.entity.BackgroundStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BackgroundStoryRepository extends JpaRepository<BackgroundStory, Long> {
    
    // 특정 펫의 배경 스토리 조회
    List<BackgroundStory> findByPetIdOrderByCreatedAtDesc(Long petId);
    
    // 펫 ID로 배경 스토리 수 조회
    Long countByPetId(Long petId);
    
    // 내용에 특정 키워드가 포함된 스토리 검색
    List<BackgroundStory> findByContentContainingIgnoreCase(String keyword);
    
    // 특정 펫의 최신 배경 스토리 조회
    @Query("SELECT bs FROM BackgroundStory bs WHERE bs.petId = :petId ORDER BY bs.createdAt DESC")
    List<BackgroundStory> findLatestStoriesByPetId(@Param("petId") Long petId);
} 
package com.my.backend.diary.repository;

import com.my.backend.diary.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DiaryRepository extends JpaRepository<Diary, Long> {
    List<Diary> findByUserId(Long userId);
    
    // Soft Delete를 위한 메서드들
    Optional<Diary> findByIdAndIsDeletedFalse(Long id);
    List<Diary> findByUserIdAndIsDeletedFalse(Long userId);
    List<Diary> findByIsDeletedFalse();
}

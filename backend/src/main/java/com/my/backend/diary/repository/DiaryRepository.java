package com.my.backend.diary.repository;

import com.my.backend.diary.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Long> {
    List<Diary> findByUserId(Long userId);
    List<Diary> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);
    List<Diary> findByIsDeletedFalseOrderByCreatedAtDesc();
}

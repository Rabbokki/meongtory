package com.my.backend.diary.repository;

import com.my.backend.account.entity.Account;
import com.my.backend.diary.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Long> {
    List<Diary> findByUser(Account user);
    List<Diary> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(Account user);
    List<Diary> findByIsDeletedFalseOrderByCreatedAtDesc();
}

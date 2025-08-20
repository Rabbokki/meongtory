package com.my.backend.community.repository;

import com.my.backend.community.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    // 전체 글 최신순
    List<CommunityPost> findAllByOrderByCreatedAtDesc();

    // 게시판 타입별 최신순 (추후 확장 대비)
    List<CommunityPost> findByBoardTypeOrderByCreatedAtDesc(String boardType);
}

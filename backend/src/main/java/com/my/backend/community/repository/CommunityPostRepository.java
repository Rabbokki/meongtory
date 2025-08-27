package com.my.backend.community.repository;

import com.my.backend.community.entity.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    // 전체 글 최신순
    List<CommunityPost> findAllByOrderByCreatedAtDesc();

    // 게시판 타입별 최신순 (추후 확장 대비)
    List<CommunityPost> findByBoardTypeOrderByCreatedAtDesc(String boardType);

    // 페이징 지원 메서드들
    Page<CommunityPost> findByBoardType(String boardType, Pageable pageable);
    
    // 검색 기능을 위한 메서드들
    Page<CommunityPost> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
        String titleKeyword, String contentKeyword, Pageable pageable);

    Page<CommunityPost> findByBoardTypeAndTitleContainingIgnoreCaseOrBoardTypeAndContentContainingIgnoreCase(
        String type1, String titleKeyword, String type2, String contentKeyword, Pageable pageable);
}

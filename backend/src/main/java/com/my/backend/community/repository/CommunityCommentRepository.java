package com.my.backend.community.repository;

import com.my.backend.community.entity.CommunityComment;
import com.my.backend.community.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {
    List<CommunityComment> findByPost(CommunityPost post);

    //  postId로 바로 조회할 수 있는 메서드 추가
    List<CommunityComment> findByPostId(Long postId);
}

package com.my.backend.community.service;

import com.my.backend.community.entity.CommunityComment;
import com.my.backend.community.entity.CommunityPost;
import com.my.backend.community.repository.CommunityCommentRepository;
import com.my.backend.community.repository.CommunityPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class AutoCommentService {

    private final CommunityCommentRepository commentRepository;
    private final CommunityPostRepository postRepository;

    // 자동 댓글 멘트 리스트
    private static final List<String> AUTO_COMMENT_MESSAGES = Arrays.asList(
        "좋은 글 감사합니다 🙌",
        "유익한 정보네요! 👍",
        "공감합니다 😊"
    );

    /**
     * 게시글 작성 후 자동 댓글 생성
     * @param postId 게시글 ID
     */
    public void createAutoComment(Long postId) {
        try {
            CommunityPost post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            // 랜덤 멘트 선택
            String randomMessage = getRandomMessage();

            // 자동 댓글 생성
            CommunityComment autoComment = CommunityComment.builder()
                    .post(post)
                    .author("Meongtory")
                    .ownerEmail("meongtory@meongtory.com") // Meongtory의 고유 식별자
                    .content(randomMessage)
                    .build();

            commentRepository.save(autoComment);

            // 게시글의 댓글 수 증가
            post.setComments(post.getComments() + 1);
            postRepository.save(post);

        } catch (Exception e) {
            // 자동 댓글 생성 실패는 로그만 남기고 예외를 던지지 않음
            // (게시글 작성 자체는 성공해야 하므로)
            System.err.println("자동 댓글 생성 실패: " + e.getMessage());
        }
    }

    /**
     * 랜덤 멘트 선택
     * @return 선택된 멘트
     */
    private String getRandomMessage() {
        Random random = new Random();
        int index = random.nextInt(AUTO_COMMENT_MESSAGES.size());
        return AUTO_COMMENT_MESSAGES.get(index);
    }
}

package com.my.backend.community.service;

import com.my.backend.account.entity.Account;
import com.my.backend.community.dto.CommunityCommentDto;
import com.my.backend.community.entity.CommunityComment;
import com.my.backend.community.entity.CommunityPost;
import com.my.backend.community.repository.CommunityCommentRepository;
import com.my.backend.community.repository.CommunityPostRepository;
import com.my.backend.community.util.ProfanityFilter;
import com.my.backend.global.exception.BadWordException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityCommentService {

    private final CommunityCommentRepository commentRepository;
    private final CommunityPostRepository postRepository;
    private final ProfanityFilter profanityFilter;

    // 댓글 목록 조회
    public List<CommunityCommentDto> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // 댓글 생성
    public CommunityCommentDto createComment(Long postId, CommunityCommentDto dto, Account account) {
        System.out.println("=== 댓글 생성 시작 ===");
        System.out.println("DTO: " + dto);
        System.out.println("Content: " + (dto != null ? dto.getContent() : "null"));
        
        // NPE 방지를 위한 null 체크
        if (dto == null || dto.getContent() == null) {
            System.out.println("NPE 발생 - BadWordException 던짐");
            throw new BadWordException("🚫 비속어를 사용하지 말아주세요.");
        }
        
        // 비속어 필터링 체크
        boolean containsProfanity = profanityFilter.containsProfanity(dto.getContent());
        System.out.println("비속어 포함 여부: " + containsProfanity);
        
        if (containsProfanity) {
            System.out.println("비속어 발견 - BadWordException 던짐");
            throw new BadWordException("🚫 비속어를 사용하지 말아주세요.");
        }

        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        CommunityComment comment = CommunityComment.builder()
                .post(post)
                .author(account.getName())        // 화면에 표시될 이름
                .ownerEmail(account.getEmail())   // 고유 식별자
                .content(dto.getContent())
                .build();

        commentRepository.save(comment);
        
        // 게시글의 댓글 갯수 증가
        post.setComments(post.getComments() + 1);
        postRepository.save(post);

        return toDto(comment);
    }

    // 댓글 수정
    public CommunityCommentDto updateComment(Long commentId, CommunityCommentDto dto, Account account) {
        System.out.println("=== 댓글 수정 시작 ===");
        System.out.println("DTO: " + dto);
        System.out.println("Content: " + (dto != null ? dto.getContent() : "null"));
        
        // NPE 방지를 위한 null 체크
        if (dto == null || dto.getContent() == null) {
            System.out.println("NPE 발생 - BadWordException 던짐");
            throw new BadWordException("🚫 비속어를 사용하지 말아주세요.");
        }
        
        // 비속어 필터링 체크
        boolean containsProfanity = profanityFilter.containsProfanity(dto.getContent());
        System.out.println("비속어 포함 여부: " + containsProfanity);
        
        if (containsProfanity) {
            System.out.println("비속어 발견 - BadWordException 던짐");
            throw new BadWordException("🚫 비속어를 사용하지 말아주세요.");
        }

        CommunityComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getOwnerEmail().equals(account.getEmail())
                && !"ROLE_ADMIN".equals(account.getRole())) {
            throw new RuntimeException("본인 댓글만 수정할 수 있습니다.");
        }

        comment.setContent(dto.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        return toDto(commentRepository.save(comment));
    }

    // 댓글 삭제
    public void deleteComment(Long commentId, Account account) {
        CommunityComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getOwnerEmail().equals(account.getEmail())
                && !"ROLE_ADMIN".equals(account.getRole())) {
            throw new RuntimeException("본인 댓글만 삭제할 수 있습니다.");
        }

        // 게시글의 댓글 갯수 감소
        CommunityPost post = comment.getPost();
        post.setComments(Math.max(0, post.getComments() - 1)); // 음수가 되지 않도록
        postRepository.save(post);

        commentRepository.delete(comment);
    }

    // Entity → DTO 변환
    private CommunityCommentDto toDto(CommunityComment comment) {
        return CommunityCommentDto.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .author(comment.getAuthor())
                .ownerEmail(comment.getOwnerEmail())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}

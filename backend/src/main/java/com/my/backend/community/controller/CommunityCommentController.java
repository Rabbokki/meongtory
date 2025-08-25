package com.my.backend.community.controller;

import com.my.backend.account.entity.Account;
import com.my.backend.community.dto.CommunityCommentDto;
import com.my.backend.community.service.CommunityCommentService;
import com.my.backend.global.security.user.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community/comments")
@RequiredArgsConstructor
public class CommunityCommentController {

    private final CommunityCommentService commentService;

    // 특정 게시글의 댓글 조회
    @GetMapping("/{postId}")
    public ResponseEntity<List<CommunityCommentDto>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    // 댓글 작성
    @PostMapping("/{postId}")
    public ResponseEntity<?> createComment(
            @PathVariable Long postId,
            @RequestBody CommunityCommentDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Account account = userDetails.getAccount();
        try {
            CommunityCommentDto response = commentService.createComment(postId, dto, account);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // 비속어 필터링 예외 처리
            if (e.getMessage().contains("비속어가 포함되어 등록할 수 없습니다")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", e.getMessage(), "message", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "댓글 작성 중 오류 발생: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "댓글 작성 중 오류 발생: " + e.getMessage()));
        }
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommunityCommentDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Account account = userDetails.getAccount();
        try {
            CommunityCommentDto response = commentService.updateComment(commentId, dto, account);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // 비속어 필터링 예외 처리
            if (e.getMessage().contains("비속어가 포함되어 등록할 수 없습니다")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", e.getMessage(), "message", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "댓글 수정 중 오류 발생: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "댓글 수정 중 오류 발생: " + e.getMessage()));
        }
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Account account = userDetails.getAccount();
        commentService.deleteComment(commentId, account);
        return ResponseEntity.ok("댓글이 삭제되었습니다.");
    }
}

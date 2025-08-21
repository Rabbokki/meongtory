package com.my.backend.community.controller;

import com.my.backend.account.entity.Account;
import com.my.backend.community.dto.CommunityCommentDto;
import com.my.backend.community.service.CommunityCommentService;
import com.my.backend.global.security.user.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<CommunityCommentDto> createComment(
            @PathVariable Long postId,
            @RequestBody CommunityCommentDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Account account = userDetails.getAccount();
        return ResponseEntity.ok(commentService.createComment(postId, dto, account));
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<CommunityCommentDto> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommunityCommentDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Account account = userDetails.getAccount();
        return ResponseEntity.ok(commentService.updateComment(commentId, dto, account));
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

package com.my.backend.community.service;

import com.my.backend.community.entity.CommunityComment;
import com.my.backend.community.entity.CommunityPost;
import com.my.backend.community.repository.CommunityCommentRepository;
import com.my.backend.community.repository.CommunityPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutoCommentServiceTest {

    @Mock
    private CommunityCommentRepository commentRepository;

    @Mock
    private CommunityPostRepository postRepository;

    @Mock
    private OpenAiService openAiService;

    @InjectMocks
    private AutoCommentService autoCommentService;

    private CommunityPost testPost;
    private CommunityComment testComment;

    @BeforeEach
    void setUp() {
        testPost = CommunityPost.builder()
                .id(1L)
                .title("테스트 게시글")
                .content("오늘 강아지와 산책을 했어요. 정말 즐거웠습니다!")
                .author("테스트 사용자")
                .category("자유게시판")
                .comments(0)
                .build();

        testComment = CommunityComment.builder()
                .id(1L)
                .post(testPost)
                .author("Meongtory")
                .ownerEmail("meongtory@meongtory.com")
                .content("좋은 산책이었네요! 🐾")
                .build();
    }

    @Test
    void createAutoComment_성공적으로_AI_댓글_생성() {
        // Given
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(openAiService.generateComment(anyString(), anyString()))
                .thenReturn("좋은 산책이었네요! 🐾");
        when(commentRepository.save(any(CommunityComment.class))).thenReturn(testComment);
        when(postRepository.save(any(CommunityPost.class))).thenReturn(testPost);

        // When
        autoCommentService.createAutoComment(1L);

        // Then
        verify(postRepository).findById(1L);
        verify(openAiService).generateComment(testPost.getContent(), testPost.getCategory());
        verify(commentRepository).save(any(CommunityComment.class));
        verify(postRepository).save(any(CommunityPost.class));
    }

    @Test
    void createAutoComment_게시글_없음_예외_처리() {
        // Given
        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        autoCommentService.createAutoComment(1L);

        // Then
        verify(postRepository).findById(1L);
        verify(openAiService, never()).generateComment(anyString(), anyString());
        verify(commentRepository, never()).save(any(CommunityComment.class));
    }

    @Test
    void createAutoComment_AI_서비스_실패_시_예외_처리() {
        // Given
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(openAiService.generateComment(anyString(), anyString()))
                .thenThrow(new RuntimeException("AI 서비스 오류"));

        // When
        autoCommentService.createAutoComment(1L);

        // Then
        verify(postRepository).findById(1L);
        verify(openAiService).generateComment(testPost.getContent(), testPost.getCategory());
        verify(commentRepository, never()).save(any(CommunityComment.class));
    }
}

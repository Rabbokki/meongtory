package com.my.backend.community.service;

import com.my.backend.account.entity.Account;
import com.my.backend.community.dto.CommunityPostDto;
import com.my.backend.community.entity.CommunityPost;
import com.my.backend.community.repository.CommunityPostRepository;
import com.my.backend.community.util.ProfanityFilter;
import com.my.backend.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityPostService {

    private final CommunityPostRepository postRepository;
    private final S3Service s3Service;
    private final ProfanityFilter profanityFilter;
    private final AutoCommentService autoCommentService;

    // 게시글 전체 조회 (최신순)
    public List<CommunityPost> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    // 게시글 상세 조회 (조회 수 증가 포함)
    public CommunityPost getPostById(Long id) {
        CommunityPost post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setViews(post.getViews() + 1);
        return postRepository.save(post);
    }

    // 조회수 증가 없는 게시글 단순 조회
    public CommunityPost findPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    // 게시글 생성
    public CommunityPostDto createPost(CommunityPostDto dto, List<MultipartFile> imgs, Account account) throws IOException {
        // 비속어 필터링 체크
        if (profanityFilter.containsProfanity(dto.getTitle()) || profanityFilter.containsProfanity(dto.getContent())) {
            throw new RuntimeException("비속어가 포함되어 등록할 수 없습니다");
        }

        List<String> imageUrls = new ArrayList<>();
        if (imgs != null && !imgs.isEmpty()) {
            for (MultipartFile file : imgs) {
                String uploadedUrl = s3Service.uploadFile(file);
                imageUrls.add(uploadedUrl);
            }
        }
        dto.setImages(imageUrls);

        CommunityPost post = CommunityPost.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .author(account.getName())
                .ownerEmail(account.getEmail())
                .category(dto.getCategory())
                .boardType(dto.getBoardType())
                .tags(dto.getTags())
                .images(imageUrls)
                .sharedFromDiaryId(dto.getSharedFromDiaryId())
                .likes(0)
                .views(0)
                .comments(0)
                .build();

        CommunityPost savedPost = postRepository.save(post);

        // 자동 댓글 생성 (비동기로 처리하여 게시글 작성 속도에 영향 없도록)
        try {
            autoCommentService.createAutoComment(savedPost.getId());
        } catch (Exception e) {
            // 자동 댓글 생성 실패는 로그만 남기고 게시글 작성은 계속 진행
            System.err.println("자동 댓글 생성 실패: " + e.getMessage());
        }

        return CommunityPostDto.builder()
                .id(savedPost.getId())
                .title(savedPost.getTitle())
                .content(savedPost.getContent())
                .author(savedPost.getAuthor())
                .ownerEmail(savedPost.getOwnerEmail())
                .category(savedPost.getCategory())
                .boardType(savedPost.getBoardType())
                .tags(savedPost.getTags())
                .images(savedPost.getImages())
                .sharedFromDiaryId(savedPost.getSharedFromDiaryId())
                .likes(savedPost.getLikes())
                .views(savedPost.getViews())
                .comments(savedPost.getComments())
                .createdAt(savedPost.getCreatedAt())
                .updatedAt(savedPost.getUpdatedAt())
                .build();
    }

    // 게시글 수정
    public CommunityPost updatePost(Long id, CommunityPostDto dto, List<MultipartFile> imgs) throws IOException {
        // 비속어 필터링 체크
        if (profanityFilter.containsProfanity(dto.getTitle()) || profanityFilter.containsProfanity(dto.getContent())) {
            throw new RuntimeException("비속어가 포함되어 등록할 수 없습니다");
        }

        CommunityPost post = findPostById(id);

        // 기존 이미지 리스트 불러오기
        List<String> imageUrls = post.getImages() != null ? new ArrayList<>(post.getImages()) : new ArrayList<>();

        // 삭제할 이미지 처리
        if (dto.getImagesToDelete() != null && !dto.getImagesToDelete().isEmpty()) {
            for (String fileName : dto.getImagesToDelete()) {
                s3Service.deleteFile(fileName);
                imageUrls.removeIf(url -> url.contains(fileName));
            }
        }

        // 새 이미지 업로드
        if (imgs != null && !imgs.isEmpty()) {
            for (MultipartFile file : imgs) {
                String uploadedUrl = s3Service.uploadFile(file);
                imageUrls.add(uploadedUrl);
            }
        }

        // 게시글 기본 필드 수정
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setCategory(dto.getCategory());
        post.setTags(dto.getTags());
        post.setImages(imageUrls);

        return postRepository.save(post);
    }

    // 게시글 삭제
    public void deletePost(Long id) {
        CommunityPost post = findPostById(id);

        if (post.getImages() != null && !post.getImages().isEmpty()) {
            for (String imageUrl : post.getImages()) {
                s3Service.deleteFile(imageUrl);
            }
        }

        postRepository.delete(post);
    }

    public CommunityPost save(CommunityPost post) {
        return postRepository.save(post);
    }
}

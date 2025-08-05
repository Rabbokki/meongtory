package com.my.backend.store.service;

import com.my.backend.store.entity.Product;
import com.my.backend.store.repository.ProductRepository;
import com.my.backend.store.repository.CartRepository;
import com.my.backend.store.dto.ProductDto;
import com.my.backend.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final S3Service s3Service;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(Product product) {
        System.out.println("=== 상품 생성 시작 ===");
        System.out.println("상품명: " + product.getName());
        System.out.println("이미지 URL: " + (product.getImageUrl() != null ? product.getImageUrl().substring(0, Math.min(50, product.getImageUrl().length())) + "..." : "null"));

        // 이미지가 Base64 형태로 전달된 경우 S3에 업로드
        if (product.getImageUrl() != null && product.getImageUrl().startsWith("data:")) {
            System.out.println("Base64 이미지 감지됨 - S3 업로드 시작");
            try {
                // Base64 이미지를 S3에 업로드하고 URL 반환
                String s3ImageUrl = s3Service.uploadBase64Image(product.getImageUrl());
                product.setImageUrl(s3ImageUrl);
                System.out.println("S3 업로드 완료: " + s3ImageUrl);
            } catch (Exception e) {
                System.out.println("S3 업로드 실패: " + e.getMessage());
                e.printStackTrace();
                // S3 업로드 실패 시 기본 이미지 사용
                product.setImageUrl("/placeholder.svg?height=300&width=300");
            }
        } else {
            System.out.println("Base64 이미지가 아님 - S3 업로드 건너뜀");
        }

        Product savedProduct = productRepository.save(product);
        System.out.println("상품 저장 완료: " + savedProduct.getProductId());
        return savedProduct;
    }

    public Product getProductById(Integer id) {
        System.out.println("=== 상품 조회 시작 ===");
        System.out.println("조회할 상품 ID: " + id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        System.out.println("조회된 상품: " + product.getName());
        System.out.println("상품 이미지 URL: " + product.getImageUrl());

        return product;
    }

    public Product updateProduct(Integer id, Product updatedProduct) {
        Product product = getProductById(id);
        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPrice(updatedProduct.getPrice());
        product.setStock(updatedProduct.getStock());

        // 기존 이미지 URL 저장
        String oldImageUrl = product.getImageUrl();

        // 이미지가 Base64 형태로 전달된 경우 S3에 업로드
        if (updatedProduct.getImageUrl() != null && updatedProduct.getImageUrl().startsWith("data:")) {
            try {
                // Base64 이미지를 S3에 업로드하고 URL 반환
                String s3ImageUrl = s3Service.uploadBase64Image(updatedProduct.getImageUrl());
                product.setImageUrl(s3ImageUrl);
                
                // 기존 S3 이미지가 있으면 삭제
                if (oldImageUrl != null && oldImageUrl.startsWith("https://")) {
                    try {
                        String fileName = oldImageUrl.substring(oldImageUrl.lastIndexOf("/") + 1);
                        s3Service.deleteFile(fileName);
                        System.out.println("기존 S3 이미지 삭제 완료: " + fileName);
                    } catch (Exception e) {
                        System.out.println("기존 S3 이미지 삭제 실패: " + e.getMessage());
                    }
                }
            } catch (Exception e) {
                System.out.println("S3 업로드 실패: " + e.getMessage());
                // S3 업로드 실패 시 기존 이미지 유지
            }
        } else if (updatedProduct.getImageUrl() != null) {
            // Base64가 아닌 경우 그대로 설정
            product.setImageUrl(updatedProduct.getImageUrl());
        }
        // imageUrl이 null인 경우 기존 이미지 유지

        return productRepository.save(product);
    }

    public void deleteProduct(Integer id) {
        try {
            System.out.println("=== 상품 삭제 시작 ===");
            System.out.println("삭제할 상품 ID: " + id);

            // 1단계: 상품 존재 여부 확인
            Product product = getProductById(id);
            if (product == null) {
                throw new RuntimeException("상품을 찾을 수 없습니다: " + id);
            }

            System.out.println("상품 정보: " + product.getName());

            // 2단계: 장바구니에서 해당 상품 삭제 (먼저 실행)
            System.out.println("2단계: 장바구니 항목 삭제 시작");
            try {
                int deletedCartItems = cartRepository.deleteByProduct_ProductId(id);
                System.out.println("장바구니 항목 삭제 완료: " + deletedCartItems + "개 항목 삭제됨");
            } catch (Exception e) {
                System.out.println("장바구니 항목 삭제 실패: " + e.getMessage());
                // 장바구니 삭제 실패해도 상품 삭제는 계속 진행
            }

            // 3단계: S3에서 이미지 파일 삭제
            System.out.println("3단계: S3 이미지 삭제 시작");
            if (product.getImageUrl() != null && product.getImageUrl().contains("s3.amazonaws.com")) {
                try {
                    s3Service.deleteFile(product.getImageUrl());
                    System.out.println("S3 이미지 삭제 완료: " + product.getImageUrl());
                } catch (Exception e) {
                    System.out.println("S3 이미지 삭제 실패 (무시): " + e.getMessage());
                }
            } else {
                System.out.println("S3 이미지가 없어서 삭제 건너뜀");
            }

            // 4단계: 상품 삭제 (마지막에 실행)
            System.out.println("4단계: 상품 삭제 시작");
            productRepository.deleteById(id);
            System.out.println("상품 삭제 완료: " + id);

            System.out.println("=== 상품 삭제 완료 ===");

        } catch (Exception e) {
            System.out.println("상품 삭제 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("상품 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    public S3Service getS3Service() {
        return s3Service;
    }

    /**
     * Product Entity -> ProductDto 변환 메서드
     */
    public ProductDto toDto(Product product) {
        if (product == null) return null;

        return ProductDto.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .category(product.getCategory())
                .targetAnimal(product.getTargetAnimal())
                .registrationDate(product.getRegistrationDate())
                .registeredBy(product.getRegisteredBy())
                .build();
    }
}
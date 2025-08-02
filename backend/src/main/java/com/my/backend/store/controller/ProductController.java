package com.my.backend.store.controller;

import com.my.backend.store.entity.Product;
import com.my.backend.store.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Integer id) {
        return productService.getProductById(id);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Integer id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public java.util.Map<String, String> deleteProduct(@PathVariable Integer id) {
        try {
            System.out.println("=== 상품 삭제 API 호출 ===");
            System.out.println("삭제 요청 상품 ID: " + id);
            
            productService.deleteProduct(id);
            
            System.out.println("상품 삭제 API 성공: " + id);
            return java.util.Map.of("message", "상품이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            System.out.println("상품 삭제 API 실패: " + e.getMessage());
            e.printStackTrace();
            return java.util.Map.of("error", "상품 삭제에 실패했습니다: " + e.getMessage());
        }
    }
    
    @PostMapping("/test-s3")
    public String testS3Upload(@RequestBody String base64Image) {
        try {
            System.out.println("=== S3 테스트 업로드 ===");
            String result = productService.getS3Service().uploadBase64Image(base64Image);
            System.out.println("테스트 업로드 성공: " + result);
            return result;
        } catch (Exception e) {
            System.out.println("테스트 업로드 실패: " + e.getMessage());
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
    
    @PostMapping("/upload-image")
    public java.util.Map<String, String> uploadImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            System.out.println("=== 이미지 업로드 엔드포인트 호출 ===");
            String imageUrl = productService.getS3Service().uploadFile(file);
            System.out.println("이미지 업로드 성공: " + imageUrl);
            return java.util.Map.of("imageUrl", imageUrl);
        } catch (Exception e) {
            System.out.println("이미지 업로드 실패: " + e.getMessage());
            e.printStackTrace();
            return java.util.Map.of("error", e.getMessage());
        }
    }
}

package com.my.backend.storeai.service;

import com.my.backend.pet.entity.MyPet;
import com.my.backend.pet.service.MyPetService;
import com.my.backend.pet.dto.MyPetListResponseDto;
import com.my.backend.store.entity.Product;
import com.my.backend.store.entity.Category;
import com.my.backend.store.service.ProductService;
import com.my.backend.store.service.NaverShoppingService;
import com.my.backend.store.dto.NaverProductDto;
import com.my.backend.store.dto.NaverShoppingSearchRequestDto;
import com.my.backend.store.entity.TargetAnimal;
import com.my.backend.store.entity.ProductSource;
import com.my.backend.storeai.dto.ProductRecommendationResponseDto;
import com.my.backend.storeai.enums.RecommendationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreAiService {
    
    private final ProductService productService;
    private final MyPetService myPetService;
    private final NaverShoppingService naverShoppingService;
    private final RestTemplate restTemplate;
    
    // 1. 상품 상세페이지용 추천
    public List<ProductRecommendationResponseDto> getProductRecommendations(
        Long productId, Long accountId, Long myPetId, RecommendationType type) {
        
        // 1) 현재 상품 정보 조회 (productId가 null이면 null)
        Product currentProduct = null;
        if (productId != null) {
            currentProduct = productService.getProduct(productId);
        }
        
        // 2) 사용자 펫 정보 조회
        MyPetListResponseDto myPetsResponse = myPetService.getMyPets(accountId);
        List<MyPet> userPets = myPetsResponse.getMyPets().stream()
            .map(dto -> {
                MyPet pet = new MyPet();
                pet.setMyPetId(dto.getMyPetId());
                pet.setName(dto.getName());
                pet.setBreed(dto.getBreed());
                pet.setAge(dto.getAge());
                pet.setType(dto.getType());
                return pet;
            })
            .collect(Collectors.toList());
        MyPet selectedPet = getSelectedPet(userPets, myPetId);
        
        // 3) AI 추천 시스템 호출
        String aiRecommendation = callAiRecommendationService(currentProduct, selectedPet, type);
        
        // 4) 추천 상품 목록 생성
        List<Product> recommendedProducts = generateRecommendations(currentProduct, selectedPet, type, aiRecommendation);
        
        return buildRecommendationResponses(recommendedProducts, selectedPet, aiRecommendation, type);
    }
    
    // 2. 사용자 펫 기반 전체 추천
    public Map<String, List<ProductRecommendationResponseDto>> getMyPetsRecommendations(Long accountId) {
        MyPetListResponseDto myPetsResponse = myPetService.getMyPets(accountId);
        List<MyPet> userPets = myPetsResponse.getMyPets().stream()
            .map(dto -> {
                MyPet pet = new MyPet();
                pet.setMyPetId(dto.getMyPetId());
                pet.setName(dto.getName());
                pet.setBreed(dto.getBreed());
                pet.setAge(dto.getAge());
                pet.setType(dto.getType());
                return pet;
            })
            .collect(Collectors.toList());
        Map<String, List<ProductRecommendationResponseDto>> result = new HashMap<>();
        
        for (MyPet pet : userPets) {
            List<ProductRecommendationResponseDto> petRecommendations = 
                getPetSpecificRecommendations(pet, RecommendationType.BREED_SPECIFIC);
            result.put(pet.getName(), petRecommendations);
        }
        
        return result;
    }
    
    // 3. 타입별 추천
    public List<ProductRecommendationResponseDto> getRecommendationsByType(Long accountId, RecommendationType type) {
        MyPetListResponseDto myPetsResponse = myPetService.getMyPets(accountId);
        List<MyPet> userPets = myPetsResponse.getMyPets().stream()
            .map(dto -> {
                MyPet pet = new MyPet();
                pet.setMyPetId(dto.getMyPetId());
                pet.setName(dto.getName());
                pet.setBreed(dto.getBreed());
                pet.setAge(dto.getAge());
                pet.setType(dto.getType());
                return pet;
            })
            .collect(Collectors.toList());
        List<ProductRecommendationResponseDto> allRecommendations = new ArrayList<>();
        
        for (MyPet pet : userPets) {
            List<ProductRecommendationResponseDto> petRecommendations = getPetSpecificRecommendations(pet, type);
            allRecommendations.addAll(petRecommendations);
        }
        
        return allRecommendations.stream()
            .sorted((p1, p2) -> Double.compare(p2.getMatchScore(), p1.getMatchScore()))
            .limit(10)
            .collect(Collectors.toList());
    }
    
    // 4. AI 서버 호출
    private String callAiRecommendationService(Product product, MyPet pet, RecommendationType type) {
        String aiServerUrl = "http://ai:9000/storeai/recommend";
        
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("age", pet != null ? pet.getAge() : null);
        requestData.put("breed", pet != null ? pet.getBreed() : null);
        requestData.put("petType", pet != null ? pet.getType().toLowerCase() : "dog");
        requestData.put("productCategory", product != null ? product.getCategory().toString() : null);
        requestData.put("productName", product != null ? product.getName() : null);
        requestData.put("recommendationType", type.toString());
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(aiServerUrl, requestData, String.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("AI 서버 호출 실패: {}", e.getMessage());
            return "AI 추천을 생성할 수 없습니다.";
        }
    }
    
    // 5. 추천 상품 생성
    private List<Product> generateRecommendations(Product currentProduct, MyPet pet, 
                                                RecommendationType type, String aiSuggestion) {
        List<Product> recommendations = new ArrayList<>();
        
        switch (type) {
            case SIMILAR:
                if (currentProduct != null) {
                    recommendations = productService.findByCategoryAndTargetAnimal(
                        currentProduct.getCategory(), currentProduct.getTargetAnimal());
                } else {
                    // 현재 상품이 없으면 전체 상품에서 추천
                    recommendations = productService.getAllProducts();
                }
                break;
            case COMPLEMENTARY:
                if (currentProduct != null) {
                    recommendations = findComplementaryProducts(currentProduct);
                } else {
                    recommendations = productService.getAllProducts();
                }
                break;
            case SEASONAL:
                if (currentProduct != null) {
                    recommendations = findSeasonalProducts(currentProduct);
                } else {
                    recommendations = findSeasonalProducts(null);
                }
                break;
            case BREED_SPECIFIC:
                recommendations = findBreedSpecificProducts(pet);
                break;
            case AGE_SPECIFIC:
                recommendations = findAgeSpecificProducts(pet);
                break;
        }
        
        // AI 서버 호출 실패 시에도 기본 추천 상품 반환
        if (recommendations.isEmpty()) {
            recommendations = productService.getAllProducts();
        }
        
        // 네이버 API 상품도 함께 가져오기
        List<Product> naverProducts = getNaverProducts(pet, type);
        recommendations.addAll(naverProducts);
        
        return filterAndSortByAiSuggestion(recommendations, aiSuggestion, pet);
    }
    
    // 6. 보완재 상품 찾기
    private List<Product> findComplementaryProducts(Product currentProduct) {
        List<Product> complementary = new ArrayList<>();
        
        switch (currentProduct.getCategory()) {
            case 사료:
                complementary.addAll(productService.findByCategory(Category.간식));
                complementary.addAll(productService.findByCategory(Category.건강관리));
                break;
            case 간식:
                complementary.addAll(productService.findByCategory(Category.장난감));
                complementary.addAll(productService.findByCategory(Category.용품));
                break;
            case 장난감:
                complementary.addAll(productService.findByCategory(Category.간식));
                break;
        }
        
        return complementary;
    }
    
    // 7. 품종별 특화 상품 찾기
    private List<Product> findBreedSpecificProducts(MyPet pet) {
        if (pet == null) return productService.getAllProducts();
        
        List<Product> breedSpecific = new ArrayList<>();
        
        // 품종별 특화 상품 검색
        if (pet.getBreed().contains("푸들")) {
            breedSpecific.addAll(productService.findByNameContaining("푸들"));
            breedSpecific.addAll(productService.findByCategory(Category.용품));
        } else if (pet.getBreed().contains("골든리트리버")) {
            breedSpecific.addAll(productService.findByNameContaining("골든"));
            breedSpecific.addAll(productService.findByCategory(Category.사료));
        } else {
            // 특정 품종이 없으면 전체 상품에서 추천
            breedSpecific.addAll(productService.getAllProducts());
        }
        
        return breedSpecific;
    }
    
    // 8. 나이별 특화 상품 찾기
    private List<Product> findAgeSpecificProducts(MyPet pet) {
        if (pet == null) return productService.getAllProducts();
        
        List<Product> ageSpecific = new ArrayList<>();
        
        if (pet.getAge() <= 1) {
            // 유아용
            ageSpecific.addAll(productService.findByNameContaining("유아"));
            ageSpecific.addAll(productService.findByNameContaining("퍼피"));
        } else if (pet.getAge() <= 3) {
            // 성장기
            ageSpecific.addAll(productService.findByNameContaining("성장"));
        } else if (pet.getAge() >= 7) {
            // 시니어
            ageSpecific.addAll(productService.findByNameContaining("시니어"));
        }
        
        // 나이별 특화 상품이 없으면 전체 상품에서 추천
        if (ageSpecific.isEmpty()) {
            ageSpecific.addAll(productService.getAllProducts());
        }
        
        return ageSpecific;
    }
    
    // 9. 계절별 상품 찾기
    private List<Product> findSeasonalProducts(Product currentProduct) {
        List<Product> seasonal = new ArrayList<>();
        int currentMonth = LocalDate.now().getMonthValue();
        
        if (currentMonth >= 6 && currentMonth <= 8) {
            // 여름
            seasonal.addAll(productService.findByNameContaining("쿨"));
            seasonal.addAll(productService.findByNameContaining("시원"));
        } else if (currentMonth >= 12 || currentMonth <= 2) {
            // 겨울
            seasonal.addAll(productService.findByNameContaining("보온"));
            seasonal.addAll(productService.findByNameContaining("따뜻"));
        }
        
        // 계절별 상품이 없으면 전체 상품에서 추천
        if (seasonal.isEmpty()) {
            seasonal = productService.getAllProducts();
        }
        
        return seasonal;
    }
    
    // 10. AI 제안을 바탕으로 필터링 및 정렬
    private List<Product> filterAndSortByAiSuggestion(List<Product> products, String aiSuggestion, MyPet pet) {
        List<Product> filteredProducts = products.stream()
            .filter(product -> isRelevantProduct(product, aiSuggestion, pet))
            .sorted((p1, p2) -> Double.compare(calculateMatchScore(p2, pet), calculateMatchScore(p1, pet)))
            .limit(5)
            .collect(Collectors.toList());
        
        // AI 서버 호출 실패 시에도 상품 반환
        if (filteredProducts.isEmpty() && !products.isEmpty()) {
            filteredProducts = products.stream()
                .sorted((p1, p2) -> Double.compare(calculateMatchScore(p2, pet), calculateMatchScore(p1, pet)))
                .limit(5)
                .collect(Collectors.toList());
        }
        
        return filteredProducts;
    }
    
    // 11. 관련 상품인지 확인
    private boolean isRelevantProduct(Product product, String aiSuggestion, MyPet pet) {
        if (aiSuggestion == null) return true;
        
        String suggestion = aiSuggestion.toLowerCase();
        String productName = product.getName().toLowerCase();
        String productDesc = product.getDescription().toLowerCase();
        
        return suggestion.contains(productName) || 
               productName.contains(suggestion) ||
               productDesc.contains(suggestion);
    }
    
    // 12. 매칭 점수 계산
    private double calculateMatchScore(Product product, MyPet pet) {
        if (pet == null) return 0.5;
        
        double score = 0.5; // 기본 점수
        
        // 품종 매칭
        if (product.getName().contains(pet.getBreed())) {
            score += 0.3;
        }
        
        // 나이 매칭
        if (pet.getAge() <= 1 && product.getName().contains("유아")) {
            score += 0.2;
        } else if (pet.getAge() >= 7 && product.getName().contains("시니어")) {
            score += 0.2;
        }
        
        return Math.min(score, 1.0);
    }
    
    // 13. 선택된 펫 가져오기
    private MyPet getSelectedPet(List<MyPet> userPets, Long myPetId) {
        if (myPetId != null) {
            return userPets.stream()
                .filter(pet -> pet.getMyPetId().equals(myPetId))
                .findFirst()
                .orElse(userPets.isEmpty() ? null : userPets.get(0));
        }
        return userPets.isEmpty() ? null : userPets.get(0);
    }
    
    // 14. 펫별 특정 추천
    private List<ProductRecommendationResponseDto> getPetSpecificRecommendations(MyPet pet, RecommendationType type) {
        List<Product> products = generateRecommendations(null, pet, type, null);
        return buildRecommendationResponses(products, pet, null, type);
    }
    
    // 15. 추천 응답 생성
    private List<ProductRecommendationResponseDto> buildRecommendationResponses(
        List<Product> products, MyPet pet, String aiSuggestion, RecommendationType type) {
        
        return products.stream()
            .map(product -> ProductRecommendationResponseDto.builder()
                .productId(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .category(product.getCategory())
                .targetAnimal(product.getTargetAnimal())
                .source(product.getSource())
                .externalProductUrl(product.getExternalProductUrl())
                .externalMallName(product.getExternalMallName())
                .recommendationReason(generateRecommendationReason(product, pet, type))
                .aiExplanation(aiSuggestion)
                .matchScore(calculateMatchScore(product, pet))
                .recommendationType(type)
                .isAiGenerated(true)
                .myPetId(pet != null ? pet.getMyPetId() : null)
                .petName(pet != null ? pet.getName() : null)
                .petBreed(pet != null ? pet.getBreed() : null)
                .petAge(pet != null ? pet.getAge() : null)
                .build())
            .collect(Collectors.toList());
    }
    
    // 16. 네이버 API 상품 가져오기
    private List<Product> getNaverProducts(MyPet pet, RecommendationType type) {
        List<Product> naverProducts = new ArrayList<>();
        
        try {
            // 펫 정보를 바탕으로 검색 키워드 생성
            String searchKeyword = generateSearchKeyword(pet, type);
            
            // 네이버 쇼핑 API로 상품 검색
            var searchRequest = NaverShoppingSearchRequestDto.builder()
                .query(searchKeyword)
                .display(10)
                .start(1)
                .sort("sim")
                .build();
            
            var naverResponse = naverShoppingService.searchProducts(searchRequest);
            
            if (naverResponse != null && naverResponse.getItems() != null) {
                // 네이버 상품을 Product 엔티티로 변환
                for (var item : naverResponse.getItems()) {
                    Product product = Product.builder()
                        .name(item.getTitle())
                        .description(item.getTitle())
                        .price(parsePrice(item.getLprice()))
                        .imageUrl(item.getImage())
                        .category(Category.용품) // 기본값
                        .targetAnimal(TargetAnimal.ALL)
                        .source(ProductSource.NAVER)
                        .externalProductUrl(item.getLink())
                        .externalMallName(item.getMallName())
                        .build();
                    naverProducts.add(product);
                }
            }
        } catch (Exception e) {
            log.error("네이버 API 상품 가져오기 실패: {}", e.getMessage());
        }
        
        return naverProducts;
    }
    
    // 17. 검색 키워드 생성
    private String generateSearchKeyword(MyPet pet, RecommendationType type) {
        if (pet == null) {
            return "반려동물 용품";
        }
        
        StringBuilder keyword = new StringBuilder();
        
        switch (type) {
            case BREED_SPECIFIC:
                keyword.append(pet.getBreed()).append(" ");
                break;
            case AGE_SPECIFIC:
                if (pet.getAge() <= 1) {
                    keyword.append("유아용 ");
                } else if (pet.getAge() >= 7) {
                    keyword.append("시니어 ");
                }
                break;
            case SEASONAL:
                int currentMonth = LocalDate.now().getMonthValue();
                if (currentMonth >= 6 && currentMonth <= 8) {
                    keyword.append("여름 ");
                } else if (currentMonth >= 12 || currentMonth <= 2) {
                    keyword.append("겨울 ");
                }
                break;
        }
        
        keyword.append("반려동물 용품");
        return keyword.toString();
    }
    
    // 18. 가격 파싱
    private Long parsePrice(String priceStr) {
        try {
            return Long.parseLong(priceStr.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return 0L;
        }
    }
    
    // 19. 추천 이유 생성
    private String generateRecommendationReason(Product product, MyPet pet, RecommendationType type) {
        if (pet == null) {
            return product.getName() + "과 관련된 상품입니다.";
        }
        
        switch (type) {
            case SIMILAR:
                return pet.getName() + "에게 유사한 " + product.getCategory() + "입니다.";
            case COMPLEMENTARY:
                return pet.getName() + "에게 보완해주는 " + product.getCategory() + "입니다.";
            case BREED_SPECIFIC:
                return pet.getBreed() + "에게 특화된 상품입니다.";
            case AGE_SPECIFIC:
                return pet.getAge() + "살 " + pet.getName() + "에게 적합한 상품입니다.";
            case SEASONAL:
                return "현재 계절에 맞는 상품입니다.";
            default:
                return pet.getName() + "에게 추천하는 상품입니다.";
        }
    }
}

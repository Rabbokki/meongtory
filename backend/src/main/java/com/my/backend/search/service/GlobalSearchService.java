package com.my.backend.search.service;

import com.my.backend.pet.entity.MyPet;
import com.my.backend.pet.repository.MyPetRepository;
import com.my.backend.search.dto.PetBasedSearchDto;
import com.my.backend.search.dto.SearchRequestDto;
import com.my.backend.search.dto.SearchResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GlobalSearchService {

    private final MyPetRepository myPetRepository;

    public SearchResponseDto performSearch(Long userId, SearchRequestDto request) {
        log.info("Performing search for user: {}, query: {}, petId: {}, type: {}", 
                userId, request.getQuery(), request.getPetId(), request.getSearchType());

        // MyPet 정보 조회
        PetBasedSearchDto petInfo = null;
        if (request.getPetId() != null) {
            Optional<MyPet> myPet = myPetRepository.findByMyPetIdAndOwnerId(request.getPetId(), userId);
            if (myPet.isPresent()) {
                petInfo = convertToPetSearchDto(myPet.get());
            }
        }

        // 검색 타입별 분기 처리
        List<Object> results = new ArrayList<>();
        List<Object> recommendations = new ArrayList<>();

        switch (request.getSearchType()) {
            case "community":
                results = searchCommunity(request.getQuery(), petInfo);
                break;
            case "store":
                results = searchStore(request.getQuery(), petInfo);
                recommendations = getStoreRecommendations(petInfo);
                break;
            case "insurance":
                results = searchInsurance(request.getQuery(), petInfo);
                recommendations = getInsuranceRecommendations(petInfo);
                break;
            case "diary":
                results = searchDiary(userId, request.getQuery(), petInfo);
                break;
            default:
                log.warn("Unknown search type: {}", request.getSearchType());
                break;
        }

        return SearchResponseDto.builder()
                .results(results)
                .recommendations(recommendations)
                .petInfo(petInfo != null ? petInfo.getName() + " (" + petInfo.getBreed() + ")" : null)
                .totalCount(results.size())
                .build();
    }

    private List<Object> searchCommunity(String query, PetBasedSearchDto petInfo) {
        // Community 검색 로직 구현
        log.info("Searching community with query: {}, pet: {}", query, petInfo);
        return new ArrayList<>();
    }

    private List<Object> searchStore(String query, PetBasedSearchDto petInfo) {
        // TODO: Store 검색 로직 구현
        // MyPet 정보를 활용한 맞춤형 상품 검색
        log.info("Searching store with query: {}, pet: {}", query, petInfo);
        return new ArrayList<>();
    }

    private List<Object> getStoreRecommendations(PetBasedSearchDto petInfo) {
        // MyPet 정보 기반 Store 추천 로직 구현
        if (petInfo == null) return new ArrayList<>();
        
        log.info("Getting store recommendations for pet: {}", petInfo);
        // Python AI 모듈 호출 예정
        return new ArrayList<>();
    }

    private List<Object> searchInsurance(String query, PetBasedSearchDto petInfo) {
        // Insurance 검색 로직 구현
        log.info("Searching insurance with query: {}, pet: {}", query, petInfo);
        return new ArrayList<>();
    }

    private List<Object> getInsuranceRecommendations(PetBasedSearchDto petInfo) {
        // MyPet 정보 기반 Insurance 추천 로직 구현
        if (petInfo == null) return new ArrayList<>();
        
        log.info("Getting insurance recommendations for pet: {}", petInfo);
        return new ArrayList<>();
    }

    private List<Object> searchDiary(Long userId, String query, PetBasedSearchDto petInfo) {
        // Diary 검색 로직 구현
        log.info("Searching diary for user: {}, query: {}, pet: {}", userId, query, petInfo);
        return new ArrayList<>();
    }

    private PetBasedSearchDto convertToPetSearchDto(MyPet myPet) {
        return PetBasedSearchDto.builder()
                .myPetId(myPet.getMyPetId())
                .name(myPet.getName())
                .breed(myPet.getBreed())
                .type(myPet.getType())
                .age(myPet.getAge())
                .weight(myPet.getWeight())
                .build();
    }
}
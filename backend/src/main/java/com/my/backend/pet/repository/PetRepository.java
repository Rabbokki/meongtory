package com.my.backend.pet.repository;

import com.my.backend.pet.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    

    
        // 펫 이름과 품종으로 정확히 검색
    Optional<Pet> findByNameAndBreed(String name, String breed);
    
    // 간단한 조회 쿼리 (테스트용)
    @Query("SELECT p FROM Pet p ORDER BY p.petId DESC")
    List<Pet> findPetsWithFilters();
} 
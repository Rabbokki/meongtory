package com.my.backend.pet.controller;

import com.my.backend.pet.entity.Pet;
import com.my.backend.pet.service.PetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PetController {
    
    private final PetService petService;
    
    // 모든 펫 조회 (통합 필터링)
    @GetMapping
    public ResponseEntity<List<Pet>> getAllPets(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String breed,
            @RequestParam(required = false) Pet.Gender gender,
            @RequestParam(required = false) Boolean adopted,
            @RequestParam(required = false) Boolean vaccinated,
            @RequestParam(required = false) Boolean neutered,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Long lastId) {
        
        log.info("Fetching pets with filters - name: {}, breed: {}, gender: {}, adopted: {}, vaccinated: {}, neutered: {}, status: {}, type: {}, location: {}, age: {}-{}, limit: {}, lastId: {}", 
                name, breed, gender, adopted, vaccinated, neutered, status, type, location, minAge, maxAge, limit, lastId);
        
        List<Pet> pets = petService.getPetsWithFilters(name, breed, gender, adopted, vaccinated, neutered, status, type, location, minAge, maxAge, limit, lastId);
        return ResponseEntity.ok(pets);
    }
    
    // 펫 상세 조회
    @GetMapping("/{petId}")
    public ResponseEntity<Pet> getPetById(@PathVariable Long petId) {
        log.info("Fetching pet with id: {}", petId);
        
        Optional<Pet> pet = petService.getPetById(petId);
        return pet.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    

    
    // 펫 등록
    @PostMapping
    public ResponseEntity<Pet> createPet(@RequestBody Pet pet) {
        log.info("Creating new pet: {}", pet.getName());
        Pet createdPet = petService.createPet(pet);
        return ResponseEntity.ok(createdPet);
    }
    
    // 펫 정보 수정
    @PutMapping("/{petId}")
    public ResponseEntity<Pet> updatePet(@PathVariable Long petId, @RequestBody Pet petDetails) {
        log.info("Received pet data - name: {}, breed: {}, personality: {}", 
                petDetails.getName(), petDetails.getBreed(), petDetails.getPersonality());
        try {
            Pet updatedPet = petService.updatePet(petId, petDetails);
            return ResponseEntity.ok(updatedPet);
        } catch (RuntimeException e) {
            log.error("Pet not found with id: {}", petId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating pet: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 펫 입양 상태 변경
    @PatchMapping("/{petId}/adoption-status")
    public ResponseEntity<Pet> updateAdoptionStatus(
            @PathVariable Long petId,
            @RequestParam Boolean adopted) {
        log.info("Updating adoption status for pet {}: {}", petId, adopted);
        try {
            Pet updatedPet = petService.updateAdoptionStatus(petId, adopted);
            return ResponseEntity.ok(updatedPet);
        } catch (RuntimeException e) {
            log.error("Pet not found with id: {}", petId);
            return ResponseEntity.notFound().build();
        }
    }
    
    // 펫 이미지 URL 업데이트
    @PatchMapping("/{petId}/image-url")
    public ResponseEntity<Pet> updatePetImageUrl(
            @PathVariable Long petId,
            @RequestParam String imageUrl) {
        log.info("Updating image URL for pet with id: {}", petId);
        try {
            Pet updatedPet = petService.updatePetImageUrl(petId, imageUrl);
            return ResponseEntity.ok(updatedPet);
        } catch (RuntimeException e) {
            log.error("Pet not found with id: {}", petId);
            return ResponseEntity.notFound().build();
        }
    }
    
    // 펫 삭제
    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(@PathVariable Long petId) {
        log.info("Deleting pet with id: {}", petId);
        try {
            petService.deletePet(petId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Pet not found with id: {}", petId);
            return ResponseEntity.notFound().build();
        }
    }
} 
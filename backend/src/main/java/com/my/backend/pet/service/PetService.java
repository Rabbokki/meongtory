package com.my.backend.pet.service;

import com.my.backend.pet.entity.Pet;
import com.my.backend.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PetService {
    
    private final PetRepository petRepository;
    
    // 통합된 펫 조회 (모든 필터링 지원)
    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }
    
    // 필터링된 펫 조회 (통합)
    public List<Pet> getPetsWithFilters(String name, String breed, Pet.Gender gender, 
                                       Boolean adopted, Boolean vaccinated, Boolean neutered,
                                       String status, String type, String location,
                                       Integer minAge, Integer maxAge, Integer limit, Long lastId) {
        // TODO: 실제 필터링 로직 구현
        return petRepository.findPetsWithFilters();
    }
    

    
    // 펫 상세 조회
    public Optional<Pet> getPetById(Long petId) {
        return petRepository.findById(petId);
    }
    

    
    // 펫 등록
    @Transactional
    public Pet createPet(Pet pet) {
        log.info("Creating new pet: {}", pet.getName());
        return petRepository.save(pet);
    }
    
    // 펫 정보 수정
    @Transactional
    public Pet updatePet(Long petId, Pet petDetails) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + petId));
        
        pet.setName(petDetails.getName());
        pet.setBreed(petDetails.getBreed());
        pet.setAge(petDetails.getAge());
        pet.setGender(petDetails.getGender());
        pet.setVaccinated(petDetails.getVaccinated());
        pet.setDescription(petDetails.getDescription());
        pet.setImageUrl(petDetails.getImageUrl());
        pet.setAdopted(petDetails.getAdopted());
        pet.setWeight(petDetails.getWeight());
        pet.setLocation(petDetails.getLocation());
        pet.setMicrochipId(petDetails.getMicrochipId());
        pet.setMedicalHistory(petDetails.getMedicalHistory());
        pet.setVaccinations(petDetails.getVaccinations());
        pet.setNotes(petDetails.getNotes());
        pet.setPersonality(petDetails.getPersonality());
        pet.setRescueStory(petDetails.getRescueStory());
        pet.setAiBackgroundStory(petDetails.getAiBackgroundStory());
        pet.setStatus(petDetails.getStatus());
        pet.setType(petDetails.getType());
        pet.setNeutered(petDetails.getNeutered());
        
        log.info("Updated pet: {}", pet.getName());
        return petRepository.save(pet);
    }
    
    // 펫 이미지 URL 업데이트 (S3 URL)
    @Transactional
    public Pet updatePetImageUrl(Long petId, String imageUrl) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + petId));
        
        pet.setImageUrl(imageUrl);
        
        log.info("Updated pet image URL: {} for pet: {}", imageUrl, pet.getName());
        return petRepository.save(pet);
    }
    
    // 펫 입양 상태 변경
    @Transactional
    public Pet updateAdoptionStatus(Long petId, Boolean adopted) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + petId));
        
        pet.setAdopted(adopted);
        log.info("Updated adoption status for pet {}: {}", pet.getName(), adopted);
        return petRepository.save(pet);
    }
    
    // 펫 삭제
    @Transactional
    public void deletePet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + petId));
        
        log.info("Deleting pet: {}", pet.getName());
        petRepository.delete(pet);
    }
} 
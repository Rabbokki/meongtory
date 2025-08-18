package com.my.backend.store.repository;

import com.my.backend.store.entity.Product;
import com.my.backend.store.entity.Category;
import com.my.backend.store.entity.TargetAnimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // StoreAI 관련 메서드들
    List<Product> findByCategoryAndTargetAnimal(Category category, TargetAnimal targetAnimal);
    
    List<Product> findByCategory(Category category);
    
    List<Product> findByNameContaining(String keyword);
}
package com.my.backend.naverapi.repository;



import com.my.backend.naverapi.entity.NaverProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NaverProductRepository extends JpaRepository<NaverProduct, Long> {
}

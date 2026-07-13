package com.laundry.BE_Laundry.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.BE_Laundry.Model.Product;

public interface ProductRepository extends JpaRepository <Product, Long>{
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByShopId(Long shopId);
    List<Product> findByCategoryIgnoreCase(String category);
    List<Product> findByShopIdAndCategoryIgnoreCase(Long shopId, String category);
}

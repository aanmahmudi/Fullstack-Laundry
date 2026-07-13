package com.laundry.BE_Laundry.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.BE_Laundry.Model.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}

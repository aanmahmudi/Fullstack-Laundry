package com.laundry.BE_Laundry.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.BE_Laundry.Model.Product;

public interface ProductRepository extends JpaRepository <Product, Long>{

}

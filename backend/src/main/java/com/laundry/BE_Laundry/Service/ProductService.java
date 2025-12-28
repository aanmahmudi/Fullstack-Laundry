package com.laundry.BE_Laundry.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.Model.Product;
import com.laundry.BE_Laundry.Repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

	private final ProductRepository productRepository;

	public Product createProduct(Product product) {
		return productRepository.save(product);
	}

	public List<Product> getAllProducts() {
		return productRepository.findAll();
	}

	public Product getProductById(Long id) {
		return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));

	}

	public Product updateProduct(Long id, Product updatedProduct) {
		Product existingProduct = getProductById(id);
		existingProduct.setName(updatedProduct.getName());
		existingProduct.setPrice(updatedProduct.getPrice());
		existingProduct.setDescription(updatedProduct.getDescription());
		return productRepository.save(existingProduct);

	}

	public void deleteProduct(Long id) {
		productRepository.deleteById(id);
	}

}

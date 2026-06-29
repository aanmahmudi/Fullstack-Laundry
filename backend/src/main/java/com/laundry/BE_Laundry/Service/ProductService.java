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

	public List<Product> getProductsByShopId(Long shopId) {
		return productRepository.findByShopId(shopId);
	}

	public List<Product> getProductsByCategory(String category) {
		return productRepository.findByCategoryIgnoreCase(category);
	}

	public List<Product> getProductsByShopIdAndCategory(Long shopId, String category) {
		return productRepository.findByShopIdAndCategoryIgnoreCase(shopId, category);
	}

	public List<Product> searchProducts(String keyword) {
		return productRepository.findByNameContainingIgnoreCase(keyword);
	}

	public Product getProductById(Long id) {
		return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));

	}

	public Product updateProduct(Long id, Product updatedProduct) {
		Product existingProduct = getProductById(id);
		existingProduct.setName(updatedProduct.getName());
		existingProduct.setPrice(updatedProduct.getPrice());
		existingProduct.setDescription(updatedProduct.getDescription());
		existingProduct.setCategory(updatedProduct.getCategory());
		existingProduct.setSizes(updatedProduct.getSizes());
		existingProduct.setColors(updatedProduct.getColors());
		existingProduct.setStockByColor(updatedProduct.getStockByColor());
		existingProduct.setVariant1Name(updatedProduct.getVariant1Name());
		existingProduct.setVariant2Name(updatedProduct.getVariant2Name());
		existingProduct.setStockTotal(updatedProduct.getStockTotal());
		existingProduct.setBrand(updatedProduct.getBrand());
		existingProduct.setMaterial(updatedProduct.getMaterial());
		existingProduct.setShelfLife(updatedProduct.getShelfLife());
		existingProduct.setWeightGrams(updatedProduct.getWeightGrams());
		existingProduct.setPackageLengthCm(updatedProduct.getPackageLengthCm());
		existingProduct.setPackageWidthCm(updatedProduct.getPackageWidthCm());
		existingProduct.setPackageHeightCm(updatedProduct.getPackageHeightCm());
		existingProduct.setShippingMethods(updatedProduct.getShippingMethods());
		existingProduct.setPreOrder(updatedProduct.getPreOrder());
		existingProduct.setPreOrderDays(updatedProduct.getPreOrderDays());
		existingProduct.setVideoUrl(updatedProduct.getVideoUrl());
		existingProduct.setExtraImageUrls(updatedProduct.getExtraImageUrls());
		existingProduct.setPhotoUrl(updatedProduct.getPhotoUrl());
		if (updatedProduct.getShopId() != null) {
			existingProduct.setShopId(updatedProduct.getShopId());
		}
		return productRepository.save(existingProduct);

	}

	public void deleteProduct(Long id) {
		productRepository.deleteById(id);
	}

}

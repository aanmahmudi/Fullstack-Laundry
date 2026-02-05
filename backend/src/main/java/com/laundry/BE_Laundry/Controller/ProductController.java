package com.laundry.BE_Laundry.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.laundry.BE_Laundry.Model.Product;
import com.laundry.BE_Laundry.Service.ProductService;
import com.laundry.BE_Laundry.Model.ProductImage;
import com.laundry.BE_Laundry.Repository.ProductImageRepository;
import com.laundry.BE_Laundry.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;
	private final ProductRepository productRepository;
	private final ProductImageRepository productImageRepository;
	@Value("${file.upload-dir}")
	private String uploadDir;

	@PostMapping
	public ResponseEntity<Product> createProduct(@RequestBody Product product) {
		return ResponseEntity.ok(productService.createProduct(product));
	}

	@GetMapping
	public ResponseEntity<List<Product>> getAllProducts(@RequestParam(required = false) String search) {
		if (search != null && !search.trim().isEmpty()) {
			return ResponseEntity.ok(productService.searchProducts(search));
		}
		return ResponseEntity.ok(productService.getAllProducts());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Product> getProductById(@PathVariable Long id) {
		return ResponseEntity.ok(productService.getProductById(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
		return ResponseEntity.ok(productService.updateProduct(id, product));

	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteProduct(@PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam("requesterId") Long requesterId) {
		Product product = productService.getProductById(id);
		
		// Strict check: Owner must exist and must match requester
		if (product.getOwnerId() == null || !product.getOwnerId().equals(requesterId)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "Anda hanya dapat menghapus produk milik Anda sendiri."));
		}
		
		productService.deleteProduct(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/migrate-images")
	public ResponseEntity<Map<String, Object>> migrateProductImages() {
		var products = productRepository.findAll();
		int migrated = 0;
		int skipped = 0;
		for (var p : products) {
			String url = p.getPhotoUrl();
			if (url == null || url.isBlank() || !url.contains("/uploads/")) {
				skipped++;
				continue;
			}
			String filename = url.substring(url.lastIndexOf('/') + 1);
			Path p1 = Paths.get(uploadDir, filename);
			Path rootUploads = Paths.get("c:\\Users\\mahmu\\OneDrive\\Documents\\Fullstack-Laundry\\uploads", filename);
			Path backendUploads = Paths.get("c:\\Users\\mahmu\\OneDrive\\Documents\\Fullstack-Laundry\\backend\\uploads", filename);
			Path fp = Files.exists(p1) ? p1 : (Files.exists(rootUploads) ? rootUploads : (Files.exists(backendUploads) ? backendUploads : null));
			if (fp == null) {
				skipped++;
				continue;
			}
			try {
				byte[] bytes = Files.readAllBytes(fp);
				String contentType = Files.probeContentType(fp);
				if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
				ProductImage img = new ProductImage();
				img.setData(bytes);
				img.setContentType(contentType);
				img.setOriginalName(filename);
				img.setProductId(p.getId());
				var saved = productImageRepository.save(img);
				p.setPhotoUrl("/api/products/image/" + saved.getId());
				productRepository.save(p);
				migrated++;
			} catch (IOException e) {
				skipped++;
			}
		}
		return ResponseEntity.ok(Map.of("migrated", migrated, "skipped", skipped));
	}

}

package com.laundry.BE_Laundry.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/products")
public class ProductImageController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadProductImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File kosong"));
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Sanitize filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) originalFilename = "image.jpg";
            String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
            String filename = UUID.randomUUID() + "_" + safeFilename;
            
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());

            // Return relative path for frontend compatibility (Frontend prepends base URL)
            String relativePath = "/uploads/" + filename;
            
            log.info("Product image uploaded successfully: {}", relativePath);

            return ResponseEntity.ok(Map.of("url", relativePath));

        } catch (IOException e) {
            log.error("Failed to upload product image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Gagal upload gambar: " + e.getMessage()));
        }
    }
}

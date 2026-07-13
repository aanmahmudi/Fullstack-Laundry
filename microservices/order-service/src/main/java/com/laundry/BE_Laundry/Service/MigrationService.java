package com.laundry.BE_Laundry.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.Model.Product;
import com.laundry.BE_Laundry.Model.ProductImage;
import com.laundry.BE_Laundry.Repository.ProductImageRepository;
import com.laundry.BE_Laundry.Repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MigrationService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public MigrationResult migrateProductImages() {
        List<Product> products = productRepository.findAll();
        int migrated = 0;
        int skipped = 0;
        for (Product p : products) {
            String url = p.getPhotoUrl();
            if (url == null || url.isBlank()) {
                skipped++;
                continue;
            }
            if (!url.contains("/uploads/")) {
                skipped++;
                continue;
            }
            String filename = url.substring(url.lastIndexOf('/') + 1);

            Optional<Path> filePathOpt = resolveFilePath(filename);
            if (filePathOpt.isEmpty()) {
                skipped++;
                continue;
            }
            Path filePath = filePathOpt.get();
            try {
                byte[] bytes = Files.readAllBytes(filePath);
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

                ProductImage img = new ProductImage();
                img.setData(bytes);
                img.setContentType(contentType);
                img.setOriginalName(filename);
                img.setProductId(p.getId());
                ProductImage saved = productImageRepository.save(img);

                // Update product photoUrl to DB-served URL
                p.setPhotoUrl("/api/products/image/" + saved.getId());
                productRepository.save(p);

                migrated++;
            } catch (IOException e) {
                skipped++;
            }
        }
        return new MigrationResult(migrated, skipped);
    }

    private Optional<Path> resolveFilePath(String filename) {
        Path p1 = Paths.get(uploadDir, filename);
        if (Files.exists(p1)) return Optional.of(p1);
        // Fallback locations observed in repository
        Path rootUploads = Paths.get("c:\\Users\\mahmu\\OneDrive\\Documents\\Fullstack-Laundry\\uploads", filename);
        if (Files.exists(rootUploads)) return Optional.of(rootUploads);
        Path backendUploads = Paths.get("c:\\Users\\mahmu\\OneDrive\\Documents\\Fullstack-Laundry\\backend\\uploads", filename);
        if (Files.exists(backendUploads)) return Optional.of(backendUploads);
        return Optional.empty();
    }

    public static record MigrationResult(int migrated, int skipped) {}
}

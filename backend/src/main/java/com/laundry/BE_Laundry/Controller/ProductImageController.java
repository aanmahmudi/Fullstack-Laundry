package com.laundry.BE_Laundry.Controller;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.laundry.BE_Laundry.Model.ProductImage;
import com.laundry.BE_Laundry.Repository.ProductImageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageRepository productImageRepository;

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(name = "productId", required = false) Long productId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File kosong"));
            }

            String originalFilename = file.getOriginalFilename() == null ? "image.jpg" : file.getOriginalFilename();
            ProductImage image = new ProductImage();
            image.setData(file.getBytes());
            image.setContentType(file.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType());
            image.setOriginalName(originalFilename);
            image.setProductId(productId);

            ProductImage saved = productImageRepository.save(image);

            String url = "/api/products/image/" + saved.getId();
            log.info("Product image stored in DB: {}", url);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            log.error("Failed to upload product image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Gagal upload gambar: " + e.getMessage()));
        }
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getProductImage(@PathVariable Long id) {
        return productImageRepository.findById(id)
                .map(img -> {
                    MediaType mediaType;
                    try {
                        mediaType = MediaType.parseMediaType(img.getContentType());
                    } catch (Exception e) {
                        mediaType = MediaType.APPLICATION_OCTET_STREAM;
                    }
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + img.getOriginalName() + "\"")
                            .contentType(mediaType)
                            .body(img.getData());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}

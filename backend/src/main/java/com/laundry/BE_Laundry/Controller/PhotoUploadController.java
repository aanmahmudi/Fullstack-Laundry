package com.laundry.BE_Laundry.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.laundry.BE_Laundry.DTO.ApiMesDocUpload;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Repository.CustomerRepository;
import com.laundry.BE_Laundry.Service.PhotoStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class PhotoUploadController {

	private final PhotoStorageService photoStorageService;
	
	private final CustomerRepository customerRepository;

	@PostMapping(value = "/upload/photo", consumes = "multipart/form-data")
	public ResponseEntity<ApiMesDocUpload<Map<String, String>>> uploadFile(
			@RequestParam("file") MultipartFile file,
			@RequestParam("customerId") Long customerId) {
		log.info(">>> File diterima: {} untuk customerId {}", file.getOriginalFilename(), customerId);

		try {
			
			//validasi dasar
			if (file == null || file.isEmpty()) {
				throw new IllegalArgumentException("File tidak boleh kosong");
			}

			String fileUrl = photoStorageService.uploadPhoto(file, customerId);

			log.info("Photo uploaded for CustomerId {}", customerId);
			return ResponseEntity.ok(
					ApiMesDocUpload.success("Upload berhasil", Map.of("fileUrl", fileUrl)));
		} catch (IllegalArgumentException e) {
			log.warn("Validasi Gagal: {}", e.getMessage());
			return ResponseEntity.badRequest().body(
					ApiMesDocUpload.fail("Upload Gagal:" + e.getMessage(), "VALIDATION_ERROR" ));
		} catch (RuntimeException e) {
			log.error("Upload gagal (runtime) untuk costumerID  {}: {} - {}", customerId, e.getClass().getSimpleName(), e.getMessage(), e);
			String message = e.getMessage() != null ? e.getMessage() : "Terjadi Kesalahan saat Upload(runtime)";
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiMesDocUpload.fail("Upload gagal: " + message, "UPLOAD_RUNTIME_ERROR"));
		} catch (IOException e) {
			log.error("Upload Gagal (IO error)Untuk CustomerId {}: {} ", customerId, e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiMesDocUpload.error("Upload gagal : Terjadi kesalahan saat upload photo."));
		}
	}
		
	@GetMapping("/upload-photo")
	public String showUploadForm(@RequestParam ("email") String email,
									@RequestParam (value = "id", required = false)Long customerId, Model model) {
		log.info("Menerima request upload-photo untuk email: '{}'", email);

		if (email == null || email.trim().isEmpty()) {
			return "redirect:/error-page?message=Email%20tidak%20boleh%20kosong";
		}
		Customer customer = customerRepository.findByEmail(email)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer dengan email tersebut tidak ditemukan"));
		model.addAttribute("email", email);
		model.addAttribute("customerId", customer.getId());
		return "upload";

	}

}

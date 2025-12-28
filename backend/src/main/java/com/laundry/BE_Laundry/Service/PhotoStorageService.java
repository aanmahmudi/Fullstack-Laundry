package com.laundry.BE_Laundry.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Model.CustomerPhoto;
import com.laundry.BE_Laundry.Repository.CustomerPhotoRepository;
import com.laundry.BE_Laundry.Repository.CustomerRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PhotoStorageService {

	private static final String UPLOAD_DIR = "uploads/";

	private final CustomerRepository customerRepository;
	private final CustomerPhotoRepository customerPhotoRepository;

	public String uploadPhoto(MultipartFile file, Long customerId) throws IOException {
		// buat folder
		Files.createDirectories(Paths.get(UPLOAD_DIR));

		// generate name file unik
		String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
		Path filePath = Paths.get(UPLOAD_DIR + filename);
		Files.write(filePath, file.getBytes());

		// generate URL file
		String fileUrl = "http://localhost:8080/uploads/" + filename;

		// simpan ke database
		Optional<Customer> customerOptional = customerRepository.findById(customerId);

		if (customerOptional.isPresent()) {
			Customer customer = customerOptional.get();
			
			// Simpan ke tabel relasi customer_photos
			CustomerPhoto photo = new CustomerPhoto();
			photo.setCustomer(customer);
			photo.setFilename(filename);
			photo.setFileUrl(fileUrl);
			customerPhotoRepository.save(photo);
			
			//kolom photo_url di tabel customers
			customer.setPhotoUrl(fileUrl);
			customerRepository.save(customer);

			return fileUrl;
		} else {
			throw new RuntimeException("Customer not found");
		}

	}

}

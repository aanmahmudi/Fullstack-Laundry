package com.laundry.BE_Laundry.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Model.CustomerDocument;
import com.laundry.BE_Laundry.Repository.CustomerDocumentRepository;
import com.laundry.BE_Laundry.Repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentStorageService {
	
	private static final String UPLOAD_DIR = "uploads/pdf/";
	
	private final CustomerRepository customerRepository;
	private final CustomerDocumentRepository documentRepository;
	
	public String uploadPDF(MultipartFile file, Long customerId)throws IOException{
		//Format PDF
		if (!file.getContentType().equals("application/pdf")) {
			throw new RuntimeException("Invalid file Type. Only PDF files are allowed.");
		}
		
		//create folder
		Files.createDirectories(Paths.get(UPLOAD_DIR));
		
		//generate name file unik
		String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
		Path filePath = Paths.get(UPLOAD_DIR, filename);
		Files.write(filePath, file.getBytes());
		
		String fileUrl = "http://localhost:8080/uploads/pdf/" + filename;
		
		Optional<Customer> customerOptional = customerRepository.findById(customerId);
		
		if (customerOptional.isPresent()) {
			Customer customer = customerOptional.get();
			
			// Simpan ke tabel relasi customer_documents
			CustomerDocument document = new CustomerDocument();
			document.setCustomer(customer);
			document.setFileName(filename);
			document.setFileUrl(fileUrl);
			documentRepository.save(document);
			
			//kolom Doc_url di tabel customers
			customer.setDocumentUrl(fileUrl);
			customerRepository.save(customer);
			
			return fileUrl;
			
		}else {
			throw new RuntimeException("Customer not found");
		}
		
	}

}

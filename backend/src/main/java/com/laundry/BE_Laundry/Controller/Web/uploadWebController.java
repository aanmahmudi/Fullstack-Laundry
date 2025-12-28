package com.laundry.BE_Laundry.Controller.Web;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneId;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Repository.CustomerRepository;
import com.laundry.BE_Laundry.Service.CustomerService;
import com.laundry.BE_Laundry.Service.EmailService;
import com.laundry.BE_Laundry.Utill.GenerateOTP;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class uploadWebController {
	
	private final CustomerRepository customerRepository;
	private final EmailService emailService;
	
	@PostMapping("/upload-data")
	public String handleUpload(@RequestParam String email, @RequestParam MultipartFile file) {
		
		if (email == null || email.isBlank()) {
			throw new IllegalArgumentException("Email tidak boleh kosong");
		}
	    // Simpan foto ➝ setelah selesai:
	    String otp = GenerateOTP.generateOTP();
	    Customer customer = customerRepository.findByEmail(email)
	    		.orElseThrow(()-> new IllegalArgumentException("Customer tidak ditemukan"));
	    
	    customer.setVerificationOtp(otp);
	    customer.setOtpExpiry(OffsetDateTime.now(ZoneId.of("Asia/Jakarta")).plusMinutes(5));
	    customerRepository.save(customer);

	    emailService.sendOTPEmail(email, otp);
	    return "redirect:/otp?email=" + email;
	}

	
	@GetMapping("/upload")
	public String showUploadPage(@RequestParam("id") Long id, Model model) {
		log.info("Accessing /upload with customerId={}", id);
	    if (id == null || id <= 0) {
	        throw new IllegalArgumentException("Customer ID tidak valid!");
	    }
	    
	    Customer customer = customerRepository.findById(id)
	    		.orElseThrow(()-> new IllegalArgumentException("Customer Tidak ditemukan"));
	    		
	    model.addAttribute("customerId", id);
	    model.addAttribute("email", customer.getEmail());
	    return "upload";
	}

}

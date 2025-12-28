package com.laundry.BE_Laundry.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.token.TokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.DTO.CustomerLoginDTO;
import com.laundry.BE_Laundry.DTO.OTPVerificationDTO;
import com.laundry.BE_Laundry.DTO.RegisterRequestDTO;
import com.laundry.BE_Laundry.DTO.UpdatePasswordRequestDTO;
import com.laundry.BE_Laundry.DTO.VerifyTokenDTO;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Repository.CustomerRepository;
import com.laundry.BE_Laundry.Utill.GenerateOTP;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

	private final CustomerRepository customerRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	
	private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);

	public Customer registerCustomer(RegisterRequestDTO registerDTO) {
		if (customerRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
			throw new IllegalArgumentException("Email already exist");
		}

		// Map dari DTO ke entity
		Customer customer = mapToCustomer(registerDTO);
		
		//Logika OTP
		String otp = GenerateOTP.generateOTP();
		customer.setVerificationOtp(otp);
		customer.setOtpExpiry((OffsetDateTime.now(ZoneId.of("Asia/Jakarta")).plusMinutes(5)));
		customer.setVerified(false);
		
		//Logika Link Token
		String token = UUID.randomUUID().toString();
		customer.setVerificationToken(token);
		customer.setTokenExpiry((OffsetDateTime.now(ZoneId.of("Asia/Jakarta")).plusMinutes(5)));
		customer.setVerified(false);
				
		// Simpan ke database
		Customer saved = customerRepository.save(customer);
		
		// Kirim Token ke email
		emailService.sendVerificationLink(customer.getEmail(), token);
		
		// Kirim OTP ke email
		emailService.sendOTPEmail(customer.getEmail(), otp);
		return saved;
		
	}

	private Customer mapToCustomer(RegisterRequestDTO registerDTO) {
		Customer customer = new Customer();
		customer.setUsername(registerDTO.getUsername());
		customer.setEmail(registerDTO.getEmail());
		customer.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
		customer.setAddress(registerDTO.getAddress());
		customer.setPlaceOfBirth(registerDTO.getPlaceOfBirth());
		customer.setDateOfBirth(registerDTO.getDateOfBirth());
		customer.setPhoneNumber(registerDTO.getPhoneNumber());
		customer.setRole(registerDTO.getRole());
		customer.setVerified(false);
		return customer;

	}

	public boolean login(CustomerLoginDTO customerLoginDTO) {
		Customer customer = customerRepository.findByEmail(customerLoginDTO.getEmail())
				.orElseThrow(() -> new RuntimeException("Customer not found"));

		System.out.println("Verifying passowrd for user: " + customer.getEmail());

		if (!passwordEncoder.matches(customerLoginDTO.getPassword(), customer.getPassword())) {
			System.out.println("Password mismatch for user: " + customer.getEmail());
			throw new RuntimeException("Invalid email or password");
		}

		if (!customer.isVerified()) {
			System.out.println("Account is not verified for user: " + customer.getEmail());
			throw new RuntimeException("Account not verified. Please Verify using OTP");
		}

		return true;
	}

	public void updatePassword(UpdatePasswordRequestDTO updatePasswordDTO) {
		Customer customer = customerRepository.findByEmail(updatePasswordDTO.getEmail())
				.orElseThrow(() -> new RuntimeException("User Not Found"));

		if (!passwordEncoder.matches(updatePasswordDTO.getOldPassword(), customer.getPassword())) {
			throw new RuntimeException("Old password is incorect");
		}

		customer.setPassword(passwordEncoder.encode(updatePasswordDTO.getNewPassword()));
		customerRepository.save(customer);
	}


	public void logout(String email) {
		Customer customer = customerRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User Not Foundd"));

		System.out.println("logged out: " + customer.getEmail());
	}

	public List<Customer> getAllCustomers() {
		return customerRepository.findAll();
	}

	public Customer getCustomerById(Long id) {
		return customerRepository.findById(id).orElseThrow(() -> new RuntimeException("Customer not found"));
	}

	public Customer updateCustomer(Long id, Customer updatedCustomer) {
		Customer existingCustomer = customerRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Customer not found"));
		existingCustomer.setUsername(updatedCustomer.getUsername());
		existingCustomer.setAddress(updatedCustomer.getAddress());
		existingCustomer.setPhoneNumber(updatedCustomer.getPhoneNumber());
		existingCustomer.setDocumentUrl(updatedCustomer.getDocumentUrl());
		existingCustomer.setPhotoUrl(updatedCustomer.getPhotoUrl());
		return customerRepository.save(existingCustomer);

	}

	public void deleteCustomer(Long id) {
		customerRepository.deleteById(id);
	}


}

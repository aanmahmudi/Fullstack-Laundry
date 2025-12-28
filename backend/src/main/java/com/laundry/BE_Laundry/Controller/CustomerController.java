package com.laundry.BE_Laundry.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.laundry.BE_Laundry.DTO.ApiResponse;
import com.laundry.BE_Laundry.DTO.CustomerLoginDTO;
import com.laundry.BE_Laundry.DTO.OTPVerificationDTO;
import com.laundry.BE_Laundry.DTO.RegisterRequestDTO;
import com.laundry.BE_Laundry.DTO.UpdatePasswordRequestDTO;
import com.laundry.BE_Laundry.DTO.VerifyTokenDTO;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Service.CustomerService;
import com.laundry.BE_Laundry.Service.PhotoStorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

	private final CustomerService customerService;

	private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);

	@PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegisterRequestDTO registerDTO, BindingResult bindingResult) {
		logger.info("Register endpoint hit with data: {}", registerDTO);
		if(bindingResult.hasErrors()) {
			String errorMessage = bindingResult.getFieldError().getDefaultMessage();
			Map<String, Object> response = new HashMap<>();
			response.put("status", "error");
			response.put("message",errorMessage);
			return ResponseEntity.badRequest().body(response);
		}
		try {
			Customer savedCustomer = customerService.registerCustomer(registerDTO);
			logger.info("Registration successful for email: {}", registerDTO.getEmail());
//			return ResponseEntity.ok("Registration successfull. Verify your account using the token");
			return ResponseEntity.ok(Map.of("message", "Registration successful. Verify your account using the token",
					"customerId", savedCustomer.getId()
					));
		} catch (IllegalArgumentException ex) {
			logger.error("Registration failed: {}", ex.getMessage());
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("Error", "Registration failed", "message", ex.getMessage()));
		} catch (Exception ex) {
			logger.error("An Unexpected : {}", ex.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal Server Error", "message", ex.getMessage()));
		}

	}

	@PostMapping("/login")
	public ResponseEntity<ApiResponse> login(@Valid @RequestBody CustomerLoginDTO customerLoginDTO,
			BindingResult bindingResult) {
		if (bindingResult.hasErrors()) {
			String errorMessage = bindingResult.getAllErrors().stream().map(ObjectError::getDefaultMessage)
					.collect(Collectors.joining(", "));
			logger.warn("Validation failed: {}", errorMessage);
			return ResponseEntity.badRequest().body(new ApiResponse("Invalid input: " + errorMessage, false));
		}

		logger.info("Login attempt for email: {}", customerLoginDTO.getEmail());
		try {
			boolean isLoginSuccessful = customerService.login(customerLoginDTO);
			if (isLoginSuccessful) {
				logger.info("Login successful for email: {}", customerLoginDTO.getEmail());
				return ResponseEntity.ok(new ApiResponse("Login Successfuly", true));
			} else {
				logger.warn("Login failed for email: {} due to {}", customerLoginDTO.getEmail());
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse("Login Failed", false));
			}
		} catch (RuntimeException ex) {
			logger.error("Login failed for email: {} due to {}", customerLoginDTO.getEmail(), ex.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(new ApiResponse("Login failed: " + ex.getMessage(), false));
		} catch (Exception ex) {
			logger.error("Unexpected error occurred during login: {}", ex.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse("An error occurred: " + ex.getMessage(), false));

		}

	}

	@PostMapping("/logout")
	public ResponseEntity<String> logout(@RequestBody Map<String, String> payload) {
		String email = payload.get("email");
		if (email == null || email.isEmpty()) {
			return ResponseEntity.badRequest().body("Email is required.");
		}
		try {
			return ResponseEntity.ok("Logout successfuly for email : " + email);
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occured:" + ex.getMessage());
		}
	}

	@PutMapping("/update-password")
	public ResponseEntity<String> updatePassword(@RequestBody UpdatePasswordRequestDTO updatePasswordDTO) {
		try {
			customerService.updatePassword(updatePasswordDTO);
			return ResponseEntity.ok("Update password successfuly");
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Update password failed:" + ex.getMessage());
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occured:" + ex.getMessage());
		}

	}

	@GetMapping
	public ResponseEntity<?> getAllCustomers() {
		List<Customer> customer = customerService.getAllCustomers();
		if (customer.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No Customers found.");
		}
		return ResponseEntity.ok(customer);

	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
		try {
			Customer customer = customerService.getCustomerById(id);
			if (customer != null) {
				return ResponseEntity.ok(customer);
			} else {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No Customers found.");
			}
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occured: " + ex.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
		return ResponseEntity.ok(customerService.updateCustomer(id, customer));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
		customerService.deleteCustomer(id);
		return ResponseEntity.noContent().build();
	}

}

package com.laundry.BE_Laundry.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.laundry.BE_Laundry.DTO.ApiResponse;
import com.laundry.BE_Laundry.DTO.CustomerLoginDTO;
import com.laundry.BE_Laundry.DTO.RegisterRequestDTO;
import com.laundry.BE_Laundry.DTO.ResetPasswordDTO;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Service.CustomerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CustomerService customerService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegisterRequestDTO registerDTO, BindingResult bindingResult) {
        logger.info("Register endpoint hit with data: {}", registerDTO);
        if(bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldError().getDefaultMessage();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", errorMessage);
            return ResponseEntity.badRequest().body(response);
        }
        try {
            Customer savedCustomer = customerService.registerCustomer(registerDTO);
            logger.info("Registration successful for email: {}", registerDTO.getEmail());
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
	public ResponseEntity<?> login(@Valid @RequestBody CustomerLoginDTO customerLoginDTO,
			BindingResult bindingResult) {
		if (bindingResult.hasErrors()) {
			String errorMessage = bindingResult.getAllErrors().stream().map(ObjectError::getDefaultMessage)
					.collect(Collectors.joining(", "));
			logger.warn("Validation failed: {}", errorMessage);
			return ResponseEntity.badRequest().body(new ApiResponse("Invalid input: " + errorMessage, false));
		}

		logger.info("Login attempt for email: {}", customerLoginDTO.getEmail());
		try {
			Customer customer = customerService.login(customerLoginDTO);
			logger.info("Login successful for email: {}", customerLoginDTO.getEmail());
			
			Map<String, Object> response = new HashMap<>();
			response.put("message", "Login Successfuly");
			response.put("success", true);
			response.put("customerId", customer.getId());
			response.put("username", customer.getUsername());
			response.put("email", customer.getEmail());
			response.put("role", customer.getRole());
			
			return ResponseEntity.ok(response);
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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        try {
            customerService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "OTP for password reset has been sent to your email."));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: " + ex.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO resetDTO) {
        try {
            customerService.resetPassword(resetDTO.getEmail(), resetDTO.getOtp(), resetDTO.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: " + ex.getMessage()));
        }
    }
}

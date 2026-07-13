package com.laundry.BE_Laundry.Controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.laundry.BE_Laundry.DTO.OTPSendDTO;
import com.laundry.BE_Laundry.DTO.OTPVerificationDTO;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Repository.CustomerRepository;
import com.laundry.BE_Laundry.Service.otp.OTPService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OTPController {

	private final OTPService otpService;
	private final CustomerRepository customerRepository;

	private static final Logger logger = LoggerFactory.getLogger(OTPController.class);

	@PostMapping("/send")
	public ResponseEntity<Map<String, String>> send(@RequestBody @Valid OTPSendDTO otpSend) {
		String email = otpSend.getEmail();
		try {
			otpService.generate(email);
			logger.info("OTP sent successfully to {}", email);
			Map<String, String> response = new HashMap<>();
			response.put("message", "OTP Sent");
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException ex) {
			logger.warn("Failed to send OTP to {} - {}", email, ex.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("message", "Failed to send OTP: " + ex.getMessage());
			return ResponseEntity.badRequest().body(response);
		} catch (IllegalStateException ex) {
			logger.warn("Failed to send OTP to {} - {}", email, ex.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("message", "Failed to send OTP: " + ex.getMessage());
			return ResponseEntity.badRequest().body(response);
		} catch (Exception ex) {
			logger.error("Unexpected error while sending OTP to {}: {}", email, ex.getMessage(), ex);
			Map<String, String> response = new HashMap<>();
			response.put("message", "An error occurred while sending OTP");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PostMapping("/verify")
	public ResponseEntity<Map<String, String>> verify(@RequestBody @Valid OTPVerificationDTO otpVerify) {
		try {
			otpService.verify(otpVerify.getEmail(), otpVerify.getOtp());
			logger.info("OTP verified for {}", otpVerify.getEmail());
			
			Map<String, String> response = new HashMap<>();
			response.put("message", "Verification via OTP Successful.");
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException ex) {
			Map<String, String> response = new HashMap<>();
			response.put("message", "Verification failed: " + ex.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		} catch (IllegalStateException ex) {
			Map<String, String> response = new HashMap<>();
			response.put("message", "Verification failed: " + ex.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		} catch (Exception ex) {
			Map<String, String> response = new HashMap<>();
			response.put("message", "An error occurred: " + ex.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PostMapping("/verify-reset")
	public ResponseEntity<Map<String, String>> verifyReset(@RequestBody @Valid OTPVerificationDTO otpVerify) {
		try {
			otpService.checkOtp(otpVerify.getEmail(), otpVerify.getOtp());
			logger.info("OTP reset verified for {}", otpVerify.getEmail());
			
			Map<String, String> response = new HashMap<>();
			response.put("message", "OTP Valid");
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException ex) {
			Map<String, String> response = new HashMap<>();
			response.put("message", ex.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		} catch (IllegalStateException ex) {
			Map<String, String> response = new HashMap<>();
			response.put("message", ex.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		} catch (Exception ex) {
			Map<String, String> response = new HashMap<>();
			response.put("message", "An error occurred: " + ex.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PostMapping("/resend")
	public ResponseEntity<Map<String, String>> resend(@RequestBody @Valid OTPSendDTO resend) {
		String email = resend.getEmail();
		try {
			otpService.generate(email);
			logger.info("OTP resent successfully to {}", email);
			Map<String, String> response = new HashMap<>();
			response.put("message", "OTP Resent");
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException ex) {
			logger.warn("Failed to resend OTP to {} - {}", email, ex.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("message", "Failed to resend OTP: " + ex.getMessage());
			return ResponseEntity.badRequest().body(response);
		} catch (IllegalStateException ex) {
			logger.warn("Failed to resend OTP to {} - {}", email, ex.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("message", "Failed to resend OTP: " + ex.getMessage());
			return ResponseEntity.badRequest().body(response);
		} catch (Exception ex) {
			logger.error("Unexpected error while resending OTP to {}: {}", email, ex.getMessage(), ex);
			Map<String, String> response = new HashMap<>();
			response.put("message", "An error occurred while resending OTP");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@GetMapping("/check")
	public ResponseEntity<?> checkOtp(@RequestParam String email) {
		return customerRepository.findByEmail(email)
				.map(c -> {
					Map<String, String> response = new HashMap<>();
					response.put("otp", c.getVerificationOtp());
					return ResponseEntity.ok(response);
				})
				.orElse(ResponseEntity.notFound().build());
	}


}

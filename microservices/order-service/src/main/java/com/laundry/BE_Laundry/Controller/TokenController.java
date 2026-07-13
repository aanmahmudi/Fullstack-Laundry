package com.laundry.BE_Laundry.Controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.laundry.BE_Laundry.DTO.OTPSendDTO;
import com.laundry.BE_Laundry.DTO.TokenSendDTO;
import com.laundry.BE_Laundry.DTO.VerifyTokenDTO;
import com.laundry.BE_Laundry.Service.TokenService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/token")
@RequiredArgsConstructor
public class TokenController {
	
	private final TokenService tokenService;
	private static final Logger logger = LoggerFactory.getLogger(TokenController.class);
	
	@PostMapping("/send")
	public ResponseEntity<Map<String, String>> send(@RequestBody @Valid TokenSendDTO tokenSend) {
		String email = tokenSend.getEmail();
		try {
			tokenService.generate(email);
			logger.info("Token sent successfully to {}", email);
			Map<String, String> response = new HashMap<>();
			response.put("message", "Token Sent");
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException ex) {
			logger.warn("Failed to send Token to {} - {}", email, ex.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("message", "Failed to send Token: " + ex.getMessage());
			return ResponseEntity.badRequest().body(response);
		} catch (Exception ex) {
			logger.error("Unexpected error while sending Token to {}: {}", email, ex.getMessage(), ex);
			Map<String, String> response = new HashMap<>();
			response.put("message", "An error occurred while sending Token");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}
	
	@PostMapping("/verify")
	public ResponseEntity<Map<String, String>> verify(@RequestBody VerifyTokenDTO verifyDTO){
		try {
			tokenService.verify(verifyDTO.getEmail(), verifyDTO.getToken());
			logger.info("Token verified for {}", verifyDTO.getEmail());
			Map<String, String> response = new HashMap<>();
			response.put("message", "Account verified");
			return ResponseEntity.ok(response);
		}catch (IllegalArgumentException ex) {
			logger.warn("Token verification failed for {}: {}", verifyDTO.getEmail(), ex.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("message", "Verification failed: " + ex.getMessage());
			return ResponseEntity.badRequest().body(response);
		}catch (Exception ex) {
			logger.error("Error verifying token for {}: {}", verifyDTO.getEmail(), ex.getMessage(), ex);
			Map<String, String> response = new HashMap<>();
			response.put("message", "An error occurred during verification");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
		
	}
	
	@PostMapping("/resend")
	public ResponseEntity<Map<String, String>> resend(@RequestBody VerifyTokenDTO verifyDTO){
		try {
			tokenService.resend(verifyDTO.getEmail());
			logger.info("Verification token resent to {}", verifyDTO.getEmail());
			Map<String, String> response = new HashMap<>();
			response.put("message", "Token Resent");
			return ResponseEntity.ok(response);
		}catch (IllegalArgumentException ex) {
			logger.warn("Resend failed for {}: {}", verifyDTO.getEmail(), ex.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("message", "Resend failed: " + ex.getMessage());
			return ResponseEntity.badRequest().body(response);
		}catch (Exception ex) {
			logger.error("Error resending token for {}: {}", verifyDTO.getEmail(), ex.getMessage(), ex);
			Map<String, String> response = new HashMap<>();
			response.put("message", "An error occurred while resending verification");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
		
	}

}

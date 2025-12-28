package com.laundry.BE_Laundry.Controller;

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
	public ResponseEntity<String> send(@RequestBody @Valid TokenSendDTO tokenSend) {
		String email = tokenSend.getEmail();
		try {
			tokenService.generate(email);
			logger.info("Token sent Successfully to {}", email);
			return ResponseEntity.ok("Token Sent");
		} catch (IllegalArgumentException ex) {
			logger.warn("Failed to send Token to {} - {}", email, ex.getMessage());
			return ResponseEntity.badRequest().body("Failed to send Token: " + ex.getMessage());
		} catch (Exception ex) {
			logger.error("Unexpected error while sending Token to {}: {}", email, ex.getMessage(), ex);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occured while sending Token");
		}
	}
	
	@PostMapping("/verify")
	public ResponseEntity<?> verify(@RequestBody VerifyTokenDTO verifyDTO){
		try {
			tokenService.verify(verifyDTO.getEmail(), verifyDTO.getToken());
			logger.info("Token verified for {}", verifyDTO.getEmail());
			return ResponseEntity.ok("Account verified");
		}catch (IllegalArgumentException ex) {
			logger.warn("Token verification failed for {}: {}", verifyDTO.getEmail(), ex.getMessage());
			return ResponseEntity.badRequest().body("Verification failed:" + ex.getMessage());
		}catch (Exception ex) {
			logger.error("Error Verify token for {}: {}", verifyDTO.getEmail(), ex.getMessage(), ex);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An Error occured during verification");
		}
		
	}
	
	@PostMapping("/resend")
	public ResponseEntity<?> resend(@RequestBody VerifyTokenDTO verifyDTO){
		try {
			tokenService.resend(verifyDTO.getEmail());
			logger.info("Verification token resent to {}", verifyDTO.getEmail());
			return ResponseEntity.ok("Token Resent");
		}catch (IllegalArgumentException ex) {
			logger.warn("Resend failed for {}: {}", verifyDTO.getEmail(), ex.getMessage());
			return ResponseEntity.badRequest().body("Resend failed:" + ex.getMessage());
		}catch (Exception ex) {
			logger.error("Error Resend token for {}: {}", verifyDTO.getEmail(), ex.getMessage(), ex);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An Error occured while resending verification");
		}
		
	}

}

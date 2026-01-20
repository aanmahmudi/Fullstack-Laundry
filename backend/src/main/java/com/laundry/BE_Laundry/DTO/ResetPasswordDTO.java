package com.laundry.BE_Laundry.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordDTO {
	@NotBlank(message = "Email is required")
	private String email;
	
	@NotBlank(message = "OTP is required")
	private String otp;
	
	@NotBlank(message = "New password is required")
	@Size(min = 8, message = "Password must be at least 8 characters")
	private String newPassword;
}

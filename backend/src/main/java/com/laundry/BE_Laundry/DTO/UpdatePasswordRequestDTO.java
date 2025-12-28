package com.laundry.BE_Laundry.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePasswordRequestDTO {
	
	@NotBlank(message = "Email not Blank")
	private String email;
	
	@NotBlank(message = "Old password is required")
	private String oldPassword;
	
	@NotBlank(message = "New password is required")
	private String newPassword;

}

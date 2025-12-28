package com.laundry.BE_Laundry.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.laundry.BE_Laundry.Model.Customer.RoleType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {
	private Long id;

	private LocalDateTime createdAt;

	@NotBlank(message = "Name is required")
	private String username;
	private String placeOfBirth;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate dateOfBirth;
	private String address;
	@NotBlank(message = "Phone number is required")
						// (\\+62)?
    @Pattern(regexp = "\\d{12,13}", message = "Phone number must be 12 or 13 digits")
	private String phoneNumber;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "Password is required")
	@Size(min = 8, message = "Password must be at least 8 characters")
	private String password;
	private String photoUrl;
	private String documentUrl;
	private RoleType role;

}

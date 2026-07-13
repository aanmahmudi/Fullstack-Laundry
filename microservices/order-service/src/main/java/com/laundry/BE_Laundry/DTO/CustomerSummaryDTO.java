package com.laundry.BE_Laundry.DTO;

import lombok.Data;

@Data
public class CustomerSummaryDTO {
	private Long id;
	private String username;
	private String email;
	private String phoneNumber;
	private String role;
}

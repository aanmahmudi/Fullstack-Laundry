package com.laundry.BE_Laundry.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class ApiResponse {
	private String message;
	private boolean success;

}

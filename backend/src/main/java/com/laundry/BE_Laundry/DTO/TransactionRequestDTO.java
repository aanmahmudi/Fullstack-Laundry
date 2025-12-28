package com.laundry.BE_Laundry.DTO;

import lombok.Data;

@Data
public class TransactionRequestDTO {

	private Long customerId;
	private Long productId;
	private int quantity;

}

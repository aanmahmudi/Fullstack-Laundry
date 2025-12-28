package com.laundry.BE_Laundry.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionResponseDTO {

	private Long id;
	private String customerName;
	private String productName;
	private int quantity;
	private BigDecimal totalPrice;
	private LocalDateTime transactionDate;
	private String paymentStatus;
	private BigDecimal paymentAmount;

}

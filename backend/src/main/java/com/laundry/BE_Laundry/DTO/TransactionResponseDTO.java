package com.laundry.BE_Laundry.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionResponseDTO {

	private Long id;
	private Long customerId;
	private String customerName;
	private Long productId;
	private String productName;
	private int quantity;
	private BigDecimal totalPrice;
	private LocalDateTime transactionDate;
	private String paymentStatus;
	private BigDecimal paymentAmount;
	private String orderStatus;
	private String shippingAddress;
	private String paymentMethod;
	private String productPhoto;

}

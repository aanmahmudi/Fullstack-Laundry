package com.laundry.BE_Laundry.DTO;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class PaymentRequestDTO {

	private Long transactionId;
	private BigDecimal paymentAmount;

}

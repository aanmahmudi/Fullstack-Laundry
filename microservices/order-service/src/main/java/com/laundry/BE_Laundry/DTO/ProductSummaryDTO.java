package com.laundry.BE_Laundry.DTO;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ProductSummaryDTO {
	private Long id;
	private String name;
	private BigDecimal price;
	private String photoUrl;
	private Long ownerId;
}

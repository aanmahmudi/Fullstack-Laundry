package com.laundry.BE_Laundry.DTO;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ProductDTO {
	
	private Long id;
	
	private String name;
	private BigDecimal price;
	private String photoUrl;
	private String description;

}

package com.laundry.BE_Laundry.DTO;

import lombok.Data;

@Data
public class ShopMessageRequestDTO {

	private Long shopId;
	private Long senderCustomerId;
	private String content;
	private Boolean fromAdmin;

}

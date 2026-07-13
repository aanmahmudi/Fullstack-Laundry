package com.laundry.BE_Laundry.DTO;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShopMessageResponseDTO {

	private Long id;
	private Long shopId;
	private Long senderCustomerId;
	private String senderName;
	private String senderPhone;
	private Boolean fromAdmin;
	private String content;
	private LocalDateTime createdAt;
	private boolean read;

}

package com.laundry.BE_Laundry.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "shop_messages")
public class ShopMessage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "shop_id", nullable = false)
	private Long shopId;

	@Column(name = "sender_customer_id", nullable = false)
	private Long senderCustomerId;

	@Column(name = "from_admin")
	private Boolean fromAdmin = Boolean.FALSE;

	@Column(name = "content", columnDefinition = "TEXT", nullable = false)
	private String content;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "is_read")
	private boolean read;
}

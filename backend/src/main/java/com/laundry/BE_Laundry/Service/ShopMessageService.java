package com.laundry.BE_Laundry.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.DTO.ShopMessageRequestDTO;
import com.laundry.BE_Laundry.DTO.ShopMessageResponseDTO;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Model.Shop;
import com.laundry.BE_Laundry.Model.ShopMessage;
import com.laundry.BE_Laundry.Repository.CustomerRepository;
import com.laundry.BE_Laundry.Repository.ShopMessageRepository;
import com.laundry.BE_Laundry.Repository.ShopRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShopMessageService {

	private final ShopMessageRepository shopMessageRepository;
	private final ShopRepository shopRepository;
	private final CustomerRepository customerRepository;

	public ShopMessageResponseDTO createMessage(ShopMessageRequestDTO dto) {
		if (dto.getShopId() == null || dto.getSenderCustomerId() == null || dto.getContent() == null
				|| dto.getContent().trim().isEmpty()) {
			throw new RuntimeException("Invalid message payload");
		}

		Shop shop = shopRepository.findById(dto.getShopId())
				.orElseThrow(() -> new RuntimeException("Shop not found"));

		customerRepository.findById(dto.getSenderCustomerId())
				.orElseThrow(() -> new RuntimeException("Customer not found"));

		boolean fromAdmin = Boolean.TRUE.equals(dto.getFromAdmin());

		ShopMessage msg = new ShopMessage();
		msg.setShopId(shop.getId());
		msg.setSenderCustomerId(dto.getSenderCustomerId());
		msg.setFromAdmin(fromAdmin);
		msg.setContent(dto.getContent().trim());
		msg.setCreatedAt(LocalDateTime.now());
		// Pesan dari user -> belum dibaca admin; pesan dari admin dianggap sudah dibaca admin
		msg.setRead(fromAdmin);

		ShopMessage saved = shopMessageRepository.save(msg);
		return mapToDTO(saved);
	}

	public List<ShopMessageResponseDTO> getMessagesForShop(Long shopId, boolean unreadOnly) {
		shopRepository.findById(shopId).orElseThrow(() -> new RuntimeException("Shop not found"));
		List<ShopMessage> list = unreadOnly
				? shopMessageRepository.findByShopIdAndReadFalseOrderByCreatedAtDesc(shopId)
				: shopMessageRepository.findByShopIdOrderByCreatedAtDesc(shopId);
		return list.stream().map(this::mapToDTO).collect(Collectors.toList());
	}

	public long countUnreadForShop(Long shopId) {
		return shopMessageRepository.findByShopIdAndReadFalseOrderByCreatedAtDesc(shopId).size();
	}

	public List<ShopMessageResponseDTO> getThread(Long shopId, Long customerId) {
		shopRepository.findById(shopId).orElseThrow(() -> new RuntimeException("Shop not found"));
		customerRepository.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found"));
		List<ShopMessage> list = shopMessageRepository
				.findByShopIdAndSenderCustomerIdOrderByCreatedAtAsc(shopId, customerId);
		return list.stream().map(this::mapToDTO).collect(Collectors.toList());
	}

	public void markAllAsRead(Long shopId) {
		List<ShopMessage> list = shopMessageRepository.findByShopIdAndReadFalseOrderByCreatedAtDesc(shopId);
		if (list.isEmpty()) {
			return;
		}
		for (ShopMessage m : list) {
			m.setRead(true);
		}
		shopMessageRepository.saveAll(list);
	}

	public void deleteById(Long id) {
		shopMessageRepository.findById(id).ifPresent(m -> {
			m.setRead(true);
			shopMessageRepository.save(m);
		});
	}

	private ShopMessageResponseDTO mapToDTO(ShopMessage msg) {
		String senderName = null;
		String senderPhone = null;
		if (msg.getSenderCustomerId() != null) {
			Customer c = customerRepository.findById(msg.getSenderCustomerId()).orElse(null);
			if (c != null) {
				senderName = c.getUsername();
				senderPhone = c.getPhoneNumber();
			}
		}
		boolean fromAdmin = Boolean.TRUE.equals(msg.getFromAdmin());
		return ShopMessageResponseDTO.builder().id(msg.getId()).shopId(msg.getShopId())
				.senderCustomerId(msg.getSenderCustomerId()).senderName(senderName).senderPhone(senderPhone)
				.fromAdmin(fromAdmin).content(msg.getContent()).createdAt(msg.getCreatedAt()).read(msg.isRead())
				.build();
	}

}

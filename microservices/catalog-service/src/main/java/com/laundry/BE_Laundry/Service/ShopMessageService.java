package com.laundry.BE_Laundry.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.DTO.ShopMessageRequestDTO;
import com.laundry.BE_Laundry.DTO.ShopMessageResponseDTO;
import com.laundry.BE_Laundry.Model.ShopMessage;
import com.laundry.BE_Laundry.Repository.ShopMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShopMessageService {

	private final ShopMessageRepository shopMessageRepository;

	public ShopMessageResponseDTO createMessage(ShopMessageRequestDTO dto) {
		if (dto.getShopId() == null || dto.getSenderCustomerId() == null || dto.getContent() == null
				|| dto.getContent().trim().isEmpty()) {
			throw new RuntimeException("Invalid message payload");
		}

		boolean fromAdmin = Boolean.TRUE.equals(dto.getFromAdmin());

		ShopMessage msg = new ShopMessage();
		msg.setShopId(dto.getShopId());
		msg.setSenderCustomerId(dto.getSenderCustomerId());
		msg.setFromAdmin(fromAdmin);
		msg.setContent(dto.getContent().trim());
		msg.setCreatedAt(LocalDateTime.now());
		msg.setRead(false);

		ShopMessage saved = shopMessageRepository.save(msg);
		return mapToDTO(saved);
	}

	public List<ShopMessageResponseDTO> getMessagesForShop(Long shopId, boolean unreadOnly) {
		List<ShopMessage> list = unreadOnly
				? shopMessageRepository.findByShopIdAndFromAdminFalseAndReadFalseOrderByCreatedAtDesc(shopId)
				: shopMessageRepository.findByShopIdOrderByCreatedAtDesc(shopId);
		return list.stream().map(this::mapToDTO).collect(Collectors.toList());
	}

	public long countUnreadForShop(Long shopId) {
		return shopMessageRepository.countByShopIdAndFromAdminFalseAndReadFalse(shopId);
	}

	public long countUnreadForAdminThread(Long shopId, Long customerId) {
		return shopMessageRepository.countByShopIdAndSenderCustomerIdAndFromAdminFalseAndReadFalse(shopId, customerId);
	}

	public long countUnreadForCustomerThread(Long shopId, Long customerId) {
		return shopMessageRepository.countByShopIdAndSenderCustomerIdAndFromAdminTrueAndReadFalse(shopId, customerId);
	}

	public long countUnreadForCustomerAllShops(Long customerId) {
		return shopMessageRepository.countBySenderCustomerIdAndFromAdminTrueAndReadFalse(customerId);
	}

	public long countUnreadForAdminAllShops(Long ownerId) {
		// Needs to be implemented properly, maybe calling identity-service
		return 0L;
	}

	public List<Map<String, Object>> listCustomerConversations(Long customerId) {
		List<ShopMessage> all = shopMessageRepository.findBySenderCustomerIdOrderByCreatedAtDesc(customerId);
		Set<Long> seen = new HashSet<>();
		List<ShopMessage> latestByShop = all.stream().filter((m) -> {
			if (m.getShopId() == null) return false;
			return seen.add(m.getShopId());
		}).collect(Collectors.toList());

		return latestByShop.stream().map((m) -> {
			Long shopId = m.getShopId();
			long unread = shopMessageRepository.countByShopIdAndSenderCustomerIdAndFromAdminTrueAndReadFalse(shopId,
					customerId);
			Map<String, Object> row = new HashMap<>();
			row.put("shopId", shopId);
			row.put("shopName", "Toko #" + shopId);
			row.put("lastMessage", m.getContent());
			row.put("lastTime", m.getCreatedAt());
			row.put("unreadCount", unread);
			return row;
		}).collect(Collectors.toList());
	}

	public Map<Long, Long> countUnreadByCustomerForShop(Long shopId) {
		List<Object[]> rows = shopMessageRepository.countUnreadByCustomerForShop(shopId);
		Map<Long, Long> out = new HashMap<>();
		for (Object[] r : rows) {
			Long customerId = r[0] == null ? null : ((Number) r[0]).longValue();
			Long cnt = r[1] == null ? 0L : ((Number) r[1]).longValue();
			if (customerId != null) {
				out.put(customerId, cnt);
			}
		}
		return out;
	}

	public List<ShopMessageResponseDTO> getThread(Long shopId, Long customerId) {
		List<ShopMessage> list = shopMessageRepository
				.findByShopIdAndSenderCustomerIdOrderByCreatedAtAsc(shopId, customerId);
		return list.stream().map(this::mapToDTO).collect(Collectors.toList());
	}

	public void markAllAsRead(Long shopId) {
		shopMessageRepository.markAllIncomingAsReadForAdmin(shopId);
	}

	public int markThreadAsReadForAdmin(Long shopId, Long customerId) {
		return shopMessageRepository.markThreadAsRead(shopId, customerId, false);
	}

	public int markThreadAsReadForCustomer(Long shopId, Long customerId) {
		return shopMessageRepository.markThreadAsRead(shopId, customerId, true);
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
		boolean fromAdmin = Boolean.TRUE.equals(msg.getFromAdmin());
		return ShopMessageResponseDTO.builder().id(msg.getId()).shopId(msg.getShopId())
				.senderCustomerId(msg.getSenderCustomerId()).senderName(senderName).senderPhone(senderPhone)
				.fromAdmin(fromAdmin).content(msg.getContent()).createdAt(msg.getCreatedAt()).read(msg.isRead())
				.build();
	}

}

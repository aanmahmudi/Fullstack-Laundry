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
		msg.setRead(false);

		ShopMessage saved = shopMessageRepository.save(msg);
		return mapToDTO(saved);
	}

	public List<ShopMessageResponseDTO> getMessagesForShop(Long shopId, boolean unreadOnly) {
		shopRepository.findById(shopId).orElseThrow(() -> new RuntimeException("Shop not found"));
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
		List<Shop> shops = shopRepository.findByOwnerId(ownerId);
		long total = 0L;
		for (Shop s : shops) {
			total += shopMessageRepository.countByShopIdAndFromAdminFalseAndReadFalse(s.getId());
		}
		return total;
	}

	public List<Map<String, Object>> listCustomerConversations(Long customerId) {
		customerRepository.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found"));
		List<ShopMessage> all = shopMessageRepository.findBySenderCustomerIdOrderByCreatedAtDesc(customerId);
		Set<Long> seen = new HashSet<>();
		List<ShopMessage> latestByShop = all.stream().filter((m) -> {
			if (m.getShopId() == null) return false;
			return seen.add(m.getShopId());
		}).collect(Collectors.toList());

		Set<Long> shopIds = latestByShop.stream().map(ShopMessage::getShopId).collect(Collectors.toSet());
		Map<Long, Shop> shops = shopRepository.findAllById(shopIds).stream().collect(Collectors.toMap(Shop::getId, (s) -> s));

		return latestByShop.stream().map((m) -> {
			Long shopId = m.getShopId();
			Shop s = shops.get(shopId);
			long unread = shopMessageRepository.countByShopIdAndSenderCustomerIdAndFromAdminTrueAndReadFalse(shopId,
					customerId);
			Map<String, Object> row = new HashMap<>();
			row.put("shopId", shopId);
			row.put("shopName", s != null ? s.getName() : ("Toko #" + shopId));
			row.put("lastMessage", m.getContent());
			row.put("lastTime", m.getCreatedAt());
			row.put("unreadCount", unread);
			return row;
		}).collect(Collectors.toList());
	}

	public Map<Long, Long> countUnreadByCustomerForShop(Long shopId) {
		shopRepository.findById(shopId).orElseThrow(() -> new RuntimeException("Shop not found"));
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
		shopRepository.findById(shopId).orElseThrow(() -> new RuntimeException("Shop not found"));
		customerRepository.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found"));
		List<ShopMessage> list = shopMessageRepository
				.findByShopIdAndSenderCustomerIdOrderByCreatedAtAsc(shopId, customerId);
		return list.stream().map(this::mapToDTO).collect(Collectors.toList());
	}

	public void markAllAsRead(Long shopId) {
		shopMessageRepository.markAllIncomingAsReadForAdmin(shopId);
	}

	public int markThreadAsReadForAdmin(Long shopId, Long customerId) {
		shopRepository.findById(shopId).orElseThrow(() -> new RuntimeException("Shop not found"));
		customerRepository.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found"));
		return shopMessageRepository.markThreadAsRead(shopId, customerId, false);
	}

	public int markThreadAsReadForCustomer(Long shopId, Long customerId) {
		shopRepository.findById(shopId).orElseThrow(() -> new RuntimeException("Shop not found"));
		customerRepository.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found"));
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

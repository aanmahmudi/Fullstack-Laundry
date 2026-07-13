package com.laundry.BE_Laundry.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import com.laundry.BE_Laundry.DTO.ShopMessageRequestDTO;
import com.laundry.BE_Laundry.DTO.ShopMessageResponseDTO;
import com.laundry.BE_Laundry.Model.Shop;
import com.laundry.BE_Laundry.Repository.ShopRepository;
import com.laundry.BE_Laundry.Service.ShopMessageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopMessageController {

	private final ShopMessageService shopMessageService;
	private final ShopRepository shopRepository;

	@PostMapping("/{shopId}/messages")
	public ResponseEntity<ShopMessageResponseDTO> createMessage(@PathVariable Long shopId,
			@RequestBody ShopMessageRequestDTO dto) {
		dto.setShopId(shopId);
		return ResponseEntity.ok(shopMessageService.createMessage(dto));
	}

	@GetMapping("/{shopId}/messages")
	public ResponseEntity<List<ShopMessageResponseDTO>> getMessages(@PathVariable Long shopId,
			@RequestParam(name = "unreadOnly", required = false, defaultValue = "false") boolean unreadOnly) {
		return ResponseEntity.ok(shopMessageService.getMessagesForShop(shopId, unreadOnly));
	}

	@GetMapping("/{shopId}/messages/thread")
	public ResponseEntity<List<ShopMessageResponseDTO>> getThread(@PathVariable Long shopId,
			@RequestParam("customerId") Long customerId) {
		return ResponseEntity.ok(shopMessageService.getThread(shopId, customerId));
	}

	@GetMapping("/{shopId}/messages/unread-count")
	public ResponseEntity<Long> getUnreadCount(@PathVariable Long shopId,
			@RequestParam(name = "viewer", required = false, defaultValue = "admin") String viewer,
			@RequestParam(name = "customerId", required = false) Long customerId) {
		if ("customer".equalsIgnoreCase(viewer)) {
			if (customerId == null) {
				throw new RuntimeException("customerId is required for viewer=customer");
			}
			return ResponseEntity.ok(shopMessageService.countUnreadForCustomerThread(shopId, customerId));
		}
		if (customerId != null) {
			return ResponseEntity.ok(shopMessageService.countUnreadForAdminThread(shopId, customerId));
		}
		return ResponseEntity.ok(shopMessageService.countUnreadForShop(shopId));
	}

	@GetMapping("/{shopId}/messages/unread-by-customer")
	public ResponseEntity<Map<Long, Long>> getUnreadByCustomer(@PathVariable Long shopId) {
		return ResponseEntity.ok(shopMessageService.countUnreadByCustomerForShop(shopId));
	}

	@PostMapping("/{shopId}/messages/mark-read")
	public ResponseEntity<Void> markAllAsRead(@PathVariable Long shopId) {
		shopRepository.findById(shopId).orElseThrow(() -> new RuntimeException("Shop not found"));
		shopMessageService.markAllAsRead(shopId);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/{shopId}/messages/thread/mark-read")
	public ResponseEntity<Void> markThreadAsRead(@PathVariable Long shopId, @RequestParam("customerId") Long customerId,
			@RequestParam(name = "viewer", required = false, defaultValue = "admin") String viewer) {
		if ("customer".equalsIgnoreCase(viewer)) {
			shopMessageService.markThreadAsReadForCustomer(shopId, customerId);
		} else {
			shopMessageService.markThreadAsReadForAdmin(shopId, customerId);
		}
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/messages/{id}")
	public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
		shopMessageService.deleteById(id);
		return ResponseEntity.noContent().build();
	}

}

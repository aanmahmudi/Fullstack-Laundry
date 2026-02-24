package com.laundry.BE_Laundry.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.BE_Laundry.Model.ShopMessage;

public interface ShopMessageRepository extends JpaRepository<ShopMessage, Long> {

	List<ShopMessage> findByShopIdOrderByCreatedAtDesc(Long shopId);

	List<ShopMessage> findByShopIdAndReadFalseOrderByCreatedAtDesc(Long shopId);

	List<ShopMessage> findByShopIdAndSenderCustomerIdOrderByCreatedAtAsc(Long shopId, Long senderCustomerId);

}

package com.laundry.BE_Laundry.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.laundry.BE_Laundry.Model.ShopMessage;

public interface ShopMessageRepository extends JpaRepository<ShopMessage, Long> {

	List<ShopMessage> findByShopIdOrderByCreatedAtDesc(Long shopId);

	List<ShopMessage> findByShopIdAndFromAdminFalseAndReadFalseOrderByCreatedAtDesc(Long shopId);

	List<ShopMessage> findByShopIdAndSenderCustomerIdOrderByCreatedAtAsc(Long shopId, Long senderCustomerId);

	long countByShopIdAndFromAdminFalseAndReadFalse(Long shopId);

	long countByShopIdAndSenderCustomerIdAndFromAdminFalseAndReadFalse(Long shopId, Long senderCustomerId);

	long countByShopIdAndSenderCustomerIdAndFromAdminTrueAndReadFalse(Long shopId, Long senderCustomerId);

	long countBySenderCustomerIdAndFromAdminTrueAndReadFalse(Long senderCustomerId);

	List<ShopMessage> findBySenderCustomerIdOrderByCreatedAtDesc(Long senderCustomerId);

	@Query("""
			select m.senderCustomerId as customerId, count(m) as cnt
			from ShopMessage m
			where m.shopId = :shopId and m.fromAdmin = false and m.read = false
			group by m.senderCustomerId
			""")
	List<Object[]> countUnreadByCustomerForShop(@Param("shopId") Long shopId);

	@Transactional
	@Modifying
	@Query("""
			update ShopMessage m
			set m.read = true
			where m.shopId = :shopId
				and m.senderCustomerId = :customerId
				and m.fromAdmin = :fromAdmin
				and m.read = false
			""")
	int markThreadAsRead(@Param("shopId") Long shopId, @Param("customerId") Long customerId,
			@Param("fromAdmin") boolean fromAdmin);

	@Transactional
	@Modifying
	@Query("""
			update ShopMessage m
			set m.read = true
			where m.shopId = :shopId
				and m.fromAdmin = false
				and m.read = false
			""")
	int markAllIncomingAsReadForAdmin(@Param("shopId") Long shopId);

}

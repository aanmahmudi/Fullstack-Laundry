package com.laundry.BE_Laundry.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.laundry.BE_Laundry.Model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
	List<Transaction> findByPaymentStatus(String paymentStatus);

}

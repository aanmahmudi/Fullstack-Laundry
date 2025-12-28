package com.laundry.BE_Laundry.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.DTO.PaymentRequestDTO;
import com.laundry.BE_Laundry.DTO.TransactionRequestDTO;
import com.laundry.BE_Laundry.DTO.TransactionResponseDTO;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Model.Product;
import com.laundry.BE_Laundry.Model.Transaction;
import com.laundry.BE_Laundry.Repository.CustomerRepository;
import com.laundry.BE_Laundry.Repository.ProductRepository;
import com.laundry.BE_Laundry.Repository.TransactionRepository;

@Service
public class TransactionService {

	private final TransactionRepository transactionRepository;

	private final CustomerRepository customerRepository;

	private final ProductRepository productRepository;

	public TransactionService(TransactionRepository transactionRepository, CustomerRepository customerRepository,
			ProductRepository productRepository) {
		this.transactionRepository = transactionRepository;
		this.customerRepository = customerRepository;
		this.productRepository = productRepository;
	}

	// melakukan payment
	public TransactionResponseDTO makePayment(PaymentRequestDTO paymentRequest) {
		Transaction transaction = transactionRepository.findById(paymentRequest.getTransactionId())
				.orElseThrow(() -> new RuntimeException("Transaction not found"));

		if ("PAID".equalsIgnoreCase(transaction.getPaymentStatus())) {
			throw new RuntimeException("Transaction is already paid.");
		}

		if (paymentRequest.getPaymentAmount().compareTo(transaction.getTotalPrice()) < 0) {
			throw new RuntimeException("Insuffiicient payment amount.");
		}

		transaction.setPaymentStatus("PAID");
		transaction.setPaymentAmount(paymentRequest.getPaymentAmount());
		transactionRepository.save(transaction);

		return mapToResponseDTO(transaction);

	}

	// get data berdasarkan yang sudah dipayment
	public List<TransactionResponseDTO> getPaidTransactions() {
		return transactionRepository.findAll().stream()
				.filter(transaction -> "PAID".equalsIgnoreCase(transaction.getPaymentStatus()))
				.map(this::mapToResponseDTO).collect(Collectors.toList());
	}
	
	public List<TransactionResponseDTO> getUnpaidTransactions(){
		return transactionRepository.findAll().stream()
				.filter(transaction -> "UNPAID".equalsIgnoreCase(transaction.getPaymentStatus()))
				.map(this::mapToResponseDTO).collect(Collectors.toList());
		
	}

	// get data all in
	public List<TransactionResponseDTO> getAllTransactions() {
		return transactionRepository.findAll().stream().map(this::mapToResponseDTO).collect(Collectors.toList());
	}

	// get data berdasarkan id
	public TransactionResponseDTO getTransactionById(Long id) {
		Transaction transaction = transactionRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Transaction not found"));
		return mapToResponseDTO(transaction);

	}

	// create transaksi baru
	public TransactionResponseDTO createTransaction(TransactionRequestDTO requestDTO) {
		try {
			System.out.println("Request DTO: " + requestDTO);
		
			Customer customer = customerRepository.findById(requestDTO.getCustomerId())
					.orElseThrow(()-> new RuntimeException("Customer not found"));
			Product product = productRepository.findById(requestDTO.getProductId())
					.orElseThrow(()-> new RuntimeException("Product not found"));
			
			Transaction transaction = new Transaction();
			transaction.setCustomer(customer);
			transaction.setProduct(product);
			transaction.setQuantity(requestDTO.getQuantity());
			transaction.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(requestDTO.getQuantity())));
			transaction.setTransactionDate(LocalDateTime.now());
			transaction.setPaymentStatus("UNPAID");
			
			transactionRepository.save(transaction);
			return mapToResponseDTO(transaction);	
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	// Melakukan payment berdasarkan ID pada transaksi
//	public TransactionResponseDTO makePayment(Long transactionId, BigDecimal paymentAmount) {
//		Transaction transaction = transactionRepository.findById(transactionId)
//				.orElseThrow(() -> new RuntimeException("Transction not found"));
//
//		if (transaction.getPaymentStatus().equals("PAID")) {
//			throw new RuntimeException("Transaction already paid");
//		}
//
//		// Memastikan Pembayaran cukup
//		if (paymentAmount.compareTo(transaction.getTotalPrice()) > 0) {
//			throw new RuntimeException("Insufficient payment amount");
//		}
//
//		transaction.setPaymentAmount(paymentAmount);
//		transaction.setPaymentStatus("PAID");
//		transactionRepository.save(transaction);
//		return mapToResponseDTO(transaction);
//	}

	// Mapping transaction ke DTO
	private TransactionResponseDTO mapToResponseDTO(Transaction transaction) {
		return TransactionResponseDTO.builder().id(transaction.getId())
				.customerName(transaction.getCustomer().getUsername())
				.productName(transaction.getProduct().getName())
				.quantity(transaction.getQuantity())
				.totalPrice(transaction.getTotalPrice())
				.transactionDate(transaction.getTransactionDate())
				.paymentStatus(transaction.getPaymentStatus())
				.paymentAmount(transaction.getPaymentAmount()).build();

	}
}

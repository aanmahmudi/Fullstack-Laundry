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
import com.laundry.BE_Laundry.Utill.SecurityUtil;

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
		String email = SecurityUtil.getCurrentUserEmail();
		if (email == null) return List.of();
		
		Customer customer = customerRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found"));
				
		if (customer.getRole() == Customer.RoleType.ADMIN) {
			return transactionRepository.findAll().stream()
					.filter(t -> t.getProduct().getOwnerId().equals(customer.getId()) && "PAID".equalsIgnoreCase(t.getPaymentStatus()))
					.map(this::mapToResponseDTO).collect(Collectors.toList());
		}
		
		return transactionRepository.findByCustomerEmailAndPaymentStatus(email, "PAID").stream()
				.map(this::mapToResponseDTO).collect(Collectors.toList());
	}
	
	public List<TransactionResponseDTO> getUnpaidTransactions(){
		String email = SecurityUtil.getCurrentUserEmail();
		if (email == null) return List.of();
		
		Customer customer = customerRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found"));
				
		if (customer.getRole() == Customer.RoleType.ADMIN) {
			return transactionRepository.findAll().stream()
					.filter(t -> t.getProduct().getOwnerId().equals(customer.getId()) && "UNPAID".equalsIgnoreCase(t.getPaymentStatus()))
					.map(this::mapToResponseDTO).collect(Collectors.toList());
		}
		
		return transactionRepository.findByCustomerEmailAndPaymentStatus(email, "UNPAID").stream()
				.map(this::mapToResponseDTO).collect(Collectors.toList());
		
	}

	// get data all in
	public List<TransactionResponseDTO> getAllTransactions() {
		String email = SecurityUtil.getCurrentUserEmail();
		if (email == null) return List.of();
		
		Customer customer = customerRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found"));
				
		if (customer.getRole() == Customer.RoleType.ADMIN) {
			return transactionRepository.findByProductOwnerId(customer.getId()).stream()
					.map(this::mapToResponseDTO).collect(Collectors.toList());
		}
		
		return transactionRepository.findByCustomerEmail(email).stream()
				.map(this::mapToResponseDTO).collect(Collectors.toList());
	}

	// get data berdasarkan id
	public TransactionResponseDTO getTransactionById(Long id) {
		Transaction transaction = transactionRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Transaction not found"));
		
		// Security check: ensure user owns this transaction
		String email = SecurityUtil.getCurrentUserEmail();
		if (!transaction.getCustomer().getEmail().equals(email)) {
			throw new RuntimeException("Unauthorized access to transaction");
		}
		
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
			transaction.setSelectedSize(requestDTO.getSelectedSize());
			transaction.setSelectedColor(requestDTO.getSelectedColor());
			transaction.setNotes(requestDTO.getNotes());
			transaction.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(requestDTO.getQuantity())));
			transaction.setTransactionDate(LocalDateTime.now());
			
			// Generate Random Order Number
			String orderNum = "ORD-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
			transaction.setOrderNumber(orderNum);

			// Set payment status based on payment method
			if ("COD".equalsIgnoreCase(requestDTO.getPaymentMethod())) {
				transaction.setPaymentStatus("UNPAID");
				transaction.setOrderStatus("DIKEMAS");
			} else if ("TRANSFER".equalsIgnoreCase(requestDTO.getPaymentMethod())) {
				transaction.setPaymentStatus("UNPAID");
				transaction.setOrderStatus("BELUM_BAYAR");
				transaction.setPaymentCode(generateTestPaymentCode());
			} else if ("CC".equalsIgnoreCase(requestDTO.getPaymentMethod()) || "PAYPAL".equalsIgnoreCase(requestDTO.getPaymentMethod())) {
				transaction.setPaymentStatus("PAID");
				transaction.setOrderStatus("DIKEMAS");
			} else {
				transaction.setPaymentStatus("UNPAID");
				transaction.setOrderStatus("BELUM_BAYAR");
				transaction.setPaymentCode(generateTestPaymentCode());
			}
			
			transaction.setPaymentMethod(requestDTO.getPaymentMethod());
			transaction.setShippingAddress(requestDTO.getShippingAddress());
			transactionRepository.save(transaction);
			return mapToResponseDTO(transaction);	
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	private String generateTestPaymentCode() {
		StringBuilder sb = new StringBuilder("888");
		java.util.Random r = new java.util.Random();
		for (int i = 0; i < 9; i++) {
			sb.append(r.nextInt(10));
		}
		return sb.toString();
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
		String sellerPhone = null;
		
		// 1. Coba ambil dari owner produk
		if (transaction.getProduct() != null && transaction.getProduct().getOwnerId() != null) {
			sellerPhone = customerRepository.findById(transaction.getProduct().getOwnerId())
					.map(Customer::getPhoneNumber)
					.orElse(null);
		}

		// 2. Jika tidak ada, fallback (Dihapus sementara untuk stabilitas)
		// Logic fallback ke Admin dihapus karena menyebabkan error startup

		// 3. Jika masih null, biarkan null agar frontend menangani dengan alert
		// if (sellerPhone == null) {
		// 	sellerPhone = "081234567890"; 
		// }

		return TransactionResponseDTO.builder().id(transaction.getId())
				.customerId(transaction.getCustomer().getId())
				.customerName(transaction.getCustomer().getUsername())
				.productId(transaction.getProduct().getId())
				.productName(transaction.getProduct().getName())
				.selectedSize(transaction.getSelectedSize())
				.selectedColor(transaction.getSelectedColor())
				.quantity(transaction.getQuantity())
				.totalPrice(transaction.getTotalPrice())
				.transactionDate(transaction.getTransactionDate())
				.paymentStatus(transaction.getPaymentStatus())
				.paymentAmount(transaction.getPaymentAmount())
				.orderStatus(transaction.getOrderStatus())
				.shippingAddress(transaction.getShippingAddress())
				.paymentMethod(transaction.getPaymentMethod())
				.productPhoto(transaction.getProduct().getPhotoUrl())
				.notes(transaction.getNotes())
				.orderNumber(transaction.getOrderNumber() != null ? transaction.getOrderNumber() : String.valueOf(transaction.getId()))
				.paymentCode(transaction.getPaymentCode())
				.sellerPhone(sellerPhone)
				.build();

	}

	public TransactionResponseDTO payByCode(Long transactionId, String paymentCode) {
		Transaction transaction = transactionRepository.findById(transactionId)
				.orElseThrow(() -> new RuntimeException("Transaction not found"));
		if ("PAID".equalsIgnoreCase(transaction.getPaymentStatus())) {
			throw new RuntimeException("Transaction is already paid.");
		}
		if (transaction.getPaymentCode() == null || !transaction.getPaymentCode().equals(paymentCode)) {
			throw new RuntimeException("Invalid payment code.");
		}
		transaction.setPaymentStatus("PAID");
		transaction.setPaymentAmount(transaction.getTotalPrice());
		transaction.setOrderStatus("DIKEMAS");
		transactionRepository.save(transaction);
		return mapToResponseDTO(transaction);
	}

	public TransactionResponseDTO updateStatus(Long id, String status) {
		Transaction transaction = transactionRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Transaction not found"));
		transaction.setOrderStatus(status);
		transactionRepository.save(transaction);
		return mapToResponseDTO(transaction);
	}
}

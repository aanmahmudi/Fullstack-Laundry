package com.laundry.BE_Laundry.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.DTO.EmailEventDTO;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Repository.CustomerRepository;
import com.laundry.BE_Laundry.Utill.GenerateOTP;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OTPService {
	private final CustomerRepository customerRepository;
	private final KafkaProducerService kafkaProducerService;
	
	public void sendOtpToCustomer(Customer customer) {
		if (customer == null) {
			throw new IllegalArgumentException("Customer tidak boleh Null");
		}
		this.generate(customer.getEmail());
	}
	
	public void sendOtpEmail(String email) {
		Customer customer = customerRepository.findByEmail(email)
				.orElseThrow(()-> new RuntimeException("Customer tidak ditemukan"));
		sendOtpToCustomer(customer);
	}
	
	public String generate (String email) {
		Customer c = customerRepository.findByEmail(email)
				.orElseThrow(()-> new RuntimeException("User not found"));
		
		
		//Cegah generate OTP Jika sudah verifikasi
		if (c.isVerified()) {
			throw new IllegalStateException("Akun sudah terverifikasi, OTP tidak diperlukan");
		}
		
		String otp;
		OffsetDateTime expiry;
		
		//Jika OTP masih aktif, gunakan OTP yang sama tapi kirim ulang emailnya
		if (c.getVerificationOtp() != null &&
				c.getOtpExpiry() != null &&
				c.getOtpExpiry().isAfter(OffsetDateTime.now(ZoneId.of("Asia/Jakarta")))) {
			otp = c.getVerificationOtp();
			expiry = c.getOtpExpiry();
		} else {
			//Generate OTP baru
			otp = GenerateOTP.generateOTP();
			expiry = (OffsetDateTime.now(ZoneId.of("Asia/Jakarta")).plusMinutes(2));
			
			c.setVerificationOtp(otp);
			c.setOtpExpiry(expiry);
			customerRepository.save(c);
		}
		
		// Kirim event ke Kafka alih-alih langsung kirim email
		EmailEventDTO event = EmailEventDTO.builder()
				.type("OTP")
				.to(email)
				.otp(otp)
				.build();
		kafkaProducerService.sendEmailEvent(event);
		
		return otp;
	}
	
	public boolean checkOtp(String email, String otp) {
		Customer c = customerRepository.findByEmail(email)
				.orElseThrow(()-> new RuntimeException("User not found"));
		
		if (c.getVerificationOtp() == null || !c.getVerificationOtp().equals(otp)) {
			throw new IllegalArgumentException("OTP Salah");
		}
		
		if (c.getOtpExpiry() != null && c.getOtpExpiry().isBefore(OffsetDateTime.now(ZoneId.of("Asia/Jakarta")))) {
			throw new IllegalArgumentException("OTP Kadaluarsa");
		}
		
		return true;
	}

	public void verify (String email, String otp) {
		Customer c = customerRepository.findUnverifiedByEmailAndOtp(email, otp)
				.orElseThrow(()-> new RuntimeException("User not found"));
		
		if (c.isVerified()) {
			throw new IllegalStateException("User already verified");
		}
		
		if (!otp.equals(c.getVerificationOtp())) {
			throw new IllegalArgumentException("Otp Salah");
		}
		if (c.getOtpExpiry().isBefore(OffsetDateTime.now(ZoneId.of("Asia/Jakarta")))) {
			throw new IllegalArgumentException("Otp Kadaluarsa");
		}
		
		
		//tanda verifikasi
		c.setVerified(true);
		c.setVerificationOtp(null);
		c.setOtpExpiry(null);
		c.setVerificationToken(null);
		c.setTokenExpiry(null);
		
		customerRepository.save(c);
	}
	
	public void resend(String email) {
		Customer c = customerRepository.findByEmail(email)
				.orElseThrow(()-> new RuntimeException("User not found"));
		if (c.isVerified()) {
			throw new RuntimeException("User Already verified, no need to resend OTP");
		}
		generate(email);
	}
	
	public String generateResetOtp(String email) {
		Customer c = customerRepository.findByEmail(email)
				.orElseThrow(()-> new RuntimeException("User not found"));
		
		//Generate OTP baru untuk reset password (tidak peduli status verified)
		String otp = GenerateOTP.generateOTP();
		OffsetDateTime expiry = (OffsetDateTime.now(ZoneId.of("Asia/Jakarta")).plusMinutes(2));
		
		c.setVerificationOtp(otp);
		c.setOtpExpiry(expiry);
		customerRepository.save(c);
		
		// Kirim event ke Kafka
		EmailEventDTO event = EmailEventDTO.builder()
				.type("OTP")
				.to(email)
				.otp(otp)
				.build();
		kafkaProducerService.sendEmailEvent(event);
		
		return otp;
	}
	

}

package com.laundry.BE_Laundry.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Repository.CustomerRepository;
import com.laundry.BE_Laundry.Utill.GenerateOTP;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OTPService {
	private final CustomerRepository customerRepository;
	private final EmailService emailService;
	
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
	
	public void generate (String email) {
		Customer c = customerRepository.findByEmail(email)
				.orElseThrow(()-> new RuntimeException("User not found"));
		
		
		//Cegah generate OTP Jika sudah verifikasi
		if (c.isVerified()) {
			throw new IllegalStateException("Akun sudah terverifikasi, OTP tidak diperlukan");
		}
		
		//Cegah spam OTP, jika OTP masih aktif, jangan buat baru.
		if (c.getVerificationOtp() != null &&
				c.getOtpExpiry() != null &&
				c.getOtpExpiry().isAfter(OffsetDateTime.now(ZoneId.of("Asia/Jakarta")))) {
				throw new IllegalStateException("OTP masih aktif, silahkan cek kembali");
		}
		
		//Generate OTP baru
		String otp = GenerateOTP.generateOTP();
		OffsetDateTime expiry = (OffsetDateTime.now(ZoneId.of("Asia/Jakarta")).plusMinutes(5));
		
		c.setVerificationOtp(otp);
		c.setOtpExpiry(expiry);
		customerRepository.save(c);
		
		emailService.sendOTPEmail(email, otp);
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
	

}

package com.laundry.BE_Laundry.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenService {
	private final CustomerRepository customerRepository;
	private final EmailService emailService;
	
	public void generate (String email) {
		Customer c = customerRepository.findByEmail(email)
				.orElseThrow(()-> new RuntimeException ("User not found"));
		
		//Cegah generate Token Jika sudah verifikasi
		if(c.isVerified())
			throw new RuntimeException("Akun sudah terverifikasi, Token tidak diperlukan");
		
		//Generate Token
		String token = UUID.randomUUID().toString();
		c.setTokenExpiry(OffsetDateTime.now(ZoneId.of("Asia/Jakarta")).plusMinutes(5));
		
		c.setVerificationToken(token);
		customerRepository.save(c);
		
		emailService.sendVerificationLink(email, token);
		
	}
	
	public void verify (String email, String token) {
		Customer c = customerRepository.findByEmail(email)
				.orElseThrow(()-> new IllegalArgumentException ("User Not Found"));
		
		if (!token.equals(c.getVerificationToken()))
			throw new IllegalArgumentException("Token salah");
		if(c.getTokenExpiry().isBefore(OffsetDateTime.now(ZoneId.of("Asia/Jakarta"))))
			throw new IllegalArgumentException("Token kadaluarsa");
		
		//tanda verifikasi
		c.setVerified(true);
		
		c.setVerificationToken(null);
		c.setTokenExpiry(null);
		c.setOtpExpiry(null);
		c.setVerificationOtp(null);
		customerRepository.save(c);
	}
	
	public void resend(String email) {
		Customer c = customerRepository.findByEmail(email)
				.orElseThrow(()-> new RuntimeException("User not found"));
		if (c.isVerified()) {
			throw new RuntimeException("User already verified, no need to resend");
		}
		generate(email);
	}

}

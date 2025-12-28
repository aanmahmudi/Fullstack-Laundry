package com.laundry.BE_Laundry.Model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "customers")
public class Customer {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)

	private Long id;
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Jakarta")
	@Column(name = "created_at", updatable = false)
	@CreationTimestamp
	private OffsetDateTime createdAt;
	
	@Column(nullable = false)
	private String username;
	
	@Column(nullable = false)
	private String placeOfBirth;
	
	@Column(name = "date_of_birth", nullable = false)
	private LocalDate dateOfBirth;
	
	@Column(nullable = true)
	private String address;
	
	@Column(nullable = true)
	private String phoneNumber;
	
	@Column(unique = true, nullable = false)
	private String email;
	
	@Column(nullable = false)
	private String password;
	
	@Column(name = "photo_url")
	private String photoUrl;
	
	@Column(name = "document_pdf")
	private String documentUrl;
	
	@Column(name = "is_verified")
	private boolean verified = false;
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Jakarta")
	private String verificationToken;
	private OffsetDateTime tokenExpiry;
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Jakarta")
	private String verificationOtp;
	private OffsetDateTime otpExpiry;
	
	@Enumerated(EnumType.STRING)
	public RoleType role;
	
	public enum RoleType {
		USER,
		ADMIN,
		PM
	}
	
	public void generateVerificationToken() {
		this.verificationToken = UUID.randomUUID().toString();
		this.tokenExpiry = OffsetDateTime.now(ZoneId.of("Asia/Jakarta")).plusMinutes(5);
	}
	

}

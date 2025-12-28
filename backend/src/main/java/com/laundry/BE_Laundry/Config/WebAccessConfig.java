package com.laundry.BE_Laundry.Config;

import org.springframework.stereotype.Component;

@Component
public class WebAccessConfig {
	
	public String [] publicEndpoints() {
		return new String [] {
				"/",
				"/register",
				"/register-web",
				"/upload-data/",
				"/upload",
				"/otp",
				"/send-otp",
				"/login-web",
				"/login",
				"/update-password-web",
				"/update-password",
				"/favicon.ico",
				"/error/**", "/css/**", "/js/**", "/images/**", "/webjars/**", "/assets/**",
				
				//customer & auth
				"/api/customers/register",
				"/api/customers/verify-token",
				"/api/customers/verify-otp",
				"/api/customers/login",
				"/api/customers/logout",
				"/api/customers/update-password",
				"/api/customers",
				"/api/customers/**",
				"/api/customers/upload/photo",
				"/api/customers/upload-photo",
				"/api/customers/upload/pdf",
				"/api/customers/upload-pdf",
				
				//OTP & TOKEN
				"/api/otp/send",
				"/spi/otp/otp",
				"/api/otp/verify",
				"/api/token/send",
				"/api/token/verify",
				
				//Product & Transaction
				"/api/products",
				"/api/products/**",
				"/api/transactions",
				"/api/transactions/**",
				"/api/transactions/payment",
				"/api/transactions/paid",
				"/api/transactions/**/payment"
		};
	}

}

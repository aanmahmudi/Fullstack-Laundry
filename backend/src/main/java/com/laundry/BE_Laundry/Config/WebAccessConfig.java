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
				
				//customer & auth (Sensitive ones removed)
				"/api/customers/register",
				"/api/customers/verify-token",
				"/api/customers/verify-otp",
				"/api/customers/login",
				"/api/customers/forgot-password",
				"/api/customers/reset-password",
				
				// Auth Controller (New)
				"/api/auth/**",
				"/api/auth/login",
				"/api/auth/register",
				"/api/auth/forgot-password",
				"/api/auth/reset-password",
				"/api/auth/logout",

				//OTP & TOKEN
				"/api/otp/send",
				"/spi/otp/otp",
				"/api/otp/verify",
				"/api/otp/verify-reset",
				"/api/otp/resend",
				"/api/otp/check",
				"/api/token/send",
				"/api/token/verify",
				
				//Product & Transaction (Public view only)
				"/api/products",
				"/api/products/**",
				"/uploads/**"
		};
	}

}

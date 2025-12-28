package com.laundry.BE_Laundry.Controller.Web;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Service.CustomerService;
import com.laundry.BE_Laundry.Service.OTPService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class otpWebController {
	
	private final OTPService otpService;
	
	@PostMapping("/send-otp")
	public String sendOtp(@RequestParam String email) {
		otpService.sendOtpEmail(email);
		return "redirect:/otp?email=" + URLEncoder.encode(email, StandardCharsets.UTF_8);
	}
	
	@GetMapping("/otp")
	public String showOtpPage(@RequestParam String email, Model model) {
		log.info("OTP page request with email: {}", email);
		model.addAttribute("email", email);
		return "otp-verification";
	}

}

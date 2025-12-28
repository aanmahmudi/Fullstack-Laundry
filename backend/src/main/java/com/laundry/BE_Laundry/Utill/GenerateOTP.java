package com.laundry.BE_Laundry.Utill;

import java.util.Random;

public class GenerateOTP {
	public static String generateOTP() {
		//OTP Testing
		//return "123456";
		//OTP Production
		return String.format("%06d", new Random(). nextInt (999999));
	}

}

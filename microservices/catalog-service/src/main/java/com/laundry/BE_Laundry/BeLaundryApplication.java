package com.laundry.BE_Laundry;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

import jakarta.annotation.PostConstruct;

import com.laundry.BE_Laundry.Controller.AuthController;
import com.laundry.BE_Laundry.Controller.CustomerController;
import com.laundry.BE_Laundry.Controller.DocumentUploadController;
import com.laundry.BE_Laundry.Controller.OTPController;
import com.laundry.BE_Laundry.Controller.PhotoUploadController;
import com.laundry.BE_Laundry.Controller.ShopController;
import com.laundry.BE_Laundry.Controller.ShopMessageController;
import com.laundry.BE_Laundry.Controller.TokenController;
import com.laundry.BE_Laundry.Controller.TransactionController;
import com.laundry.BE_Laundry.Controller.Web.otpWebController;
import com.laundry.BE_Laundry.Controller.Web.registerWebController;
import com.laundry.BE_Laundry.Controller.Web.uploadWebController;
import com.laundry.BE_Laundry.Service.CustomerService;
import com.laundry.BE_Laundry.Service.DocumentStorageService;
import com.laundry.BE_Laundry.Service.EmailService;
import com.laundry.BE_Laundry.Service.KafkaConsumerService;
import com.laundry.BE_Laundry.Service.KafkaProducerService;
import com.laundry.BE_Laundry.Service.OTPService;
import com.laundry.BE_Laundry.Service.PhotoStorageService;
import com.laundry.BE_Laundry.Service.ShopMessageService;
import com.laundry.BE_Laundry.Service.ShopService;
import com.laundry.BE_Laundry.Service.TokenService;
import com.laundry.BE_Laundry.Service.TransactionService;

@SpringBootApplication(scanBasePackages = "com.laundry.BE_Laundry")
@ComponentScan(
	basePackages = "com.laundry.BE_Laundry",
	excludeFilters = {
		@ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
			AuthController.class,
			CustomerController.class,
			DocumentUploadController.class,
			OTPController.class,
			PhotoUploadController.class,
			ShopController.class,
			ShopMessageController.class,
			TokenController.class,
			TransactionController.class,
			otpWebController.class,
			registerWebController.class,
			uploadWebController.class,
			CustomerService.class,
			DocumentStorageService.class,
			EmailService.class,
			KafkaConsumerService.class,
			KafkaProducerService.class,
			OTPService.class,
			PhotoStorageService.class,
			ShopMessageService.class,
			ShopService.class,
			TokenService.class,
			TransactionService.class
		})
	}
)
public class BeLaundryApplication extends SpringBootServletInitializer{

	@PostConstruct
    public void started() {
        // Set default timezone ke Asia/Jakarta
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Jakarta"));
        System.out.println("Timezone set to: " + TimeZone.getDefault().getID());
    }
	
	@PostConstruct
	public void checkTime() {
	    System.out.println(">>> JVM ZoneId: " + ZoneId.systemDefault());
	    System.out.println(">>> OffsetDateTime.now(): " + OffsetDateTime.now());
	}
	
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(BeLaundryApplication.class);
		
	}

	public static void main(String[] args) {
		SpringApplication.run(BeLaundryApplication.class, args);
	}

}

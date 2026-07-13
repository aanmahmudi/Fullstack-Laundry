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

import com.laundry.BE_Laundry.Controller.ProductController;
import com.laundry.BE_Laundry.Controller.ProductImageController;
import com.laundry.BE_Laundry.Controller.TransactionController;
import com.laundry.BE_Laundry.Service.MigrationService;
import com.laundry.BE_Laundry.Service.ProductService;
import com.laundry.BE_Laundry.Service.TransactionService;

@SpringBootApplication(scanBasePackages = "com.laundry.BE_Laundry")
@ComponentScan(
	basePackages = "com.laundry.BE_Laundry",
	excludeFilters = {
		@ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
			ProductController.class,
			ProductImageController.class,
			TransactionController.class,
			ProductService.class,
			MigrationService.class,
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

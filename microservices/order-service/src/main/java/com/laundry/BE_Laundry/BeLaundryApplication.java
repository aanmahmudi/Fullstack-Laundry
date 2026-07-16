package com.laundry.BE_Laundry;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

import jakarta.annotation.PostConstruct;

@SpringBootApplication(scanBasePackages = "com.laundry.BE_Laundry")
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

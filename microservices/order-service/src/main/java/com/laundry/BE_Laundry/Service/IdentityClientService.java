package com.laundry.BE_Laundry.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.laundry.BE_Laundry.DTO.CustomerSummaryDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IdentityClientService {
	private final RestTemplate restTemplate;

	@Value("${services.identity.base-url:http://identity-service:8080}")
	private String identityBaseUrl;

	public CustomerSummaryDTO getCustomerById(Long id) {
		return restTemplate.getForObject(identityBaseUrl + "/api/customers/" + id + "/summary", CustomerSummaryDTO.class);
	}

	public CustomerSummaryDTO getCustomerByEmail(String email) {
		return restTemplate.getForObject(identityBaseUrl + "/api/customers/summary/by-email?email={email}", CustomerSummaryDTO.class, email);
	}
}

package com.laundry.BE_Laundry.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.laundry.BE_Laundry.DTO.ProductSummaryDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CatalogClientService {
	private final RestTemplate restTemplate;

	@Value("${services.catalog.base-url:http://catalog-service:8080}")
	private String catalogBaseUrl;

	public ProductSummaryDTO getProductById(Long id) {
		return restTemplate.getForObject(catalogBaseUrl + "/api/products/" + id + "/summary", ProductSummaryDTO.class);
	}
}

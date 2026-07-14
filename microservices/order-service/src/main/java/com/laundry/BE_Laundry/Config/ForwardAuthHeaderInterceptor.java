package com.laundry.BE_Laundry.Config;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ForwardAuthHeaderInterceptor implements ClientHttpRequestInterceptor {
	private static final Logger logger = LoggerFactory.getLogger(ForwardAuthHeaderInterceptor.class);

	@Override
	public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
		if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
			String authorization = resolveAuthorizationHeader();
			if (authorization != null && !authorization.isBlank()) {
				logger.info("Forwarding Authorization header to: {}", request.getURI());
				request.getHeaders().set(HttpHeaders.AUTHORIZATION, authorization);
			} else {
				logger.warn("No Authorization header found in current request context to : {}", request.getURI());
			}
		}

		return execution.execute(request, body);
	}

	private String resolveAuthorizationHeader() {
		try {
			if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
				HttpServletRequest servletRequest = attrs.getRequest();
				String authHeader = servletRequest.getHeader(HttpHeaders.AUTHORIZATION);
				if (authHeader != null) {
					return authHeader;
				}
			}
			return null;
		} catch (Exception e) {
			logger.error("Error resolving Authorization header: {}", e.getMessage(), e);
			return null;
		}
	}
}

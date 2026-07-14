package com.laundry.BE_Laundry.Config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

public class CustomLoggingFilter implements Filter {

	private static final Logger logger = LoggerFactory.getLogger(CustomLoggingFilter.class);
	
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		
		HttpServletRequest req = (HttpServletRequest) request;
		String path = req.getRequestURI();
		
		if (!req.getRequestURI().equals("/favicon.ico")) {
			boolean hasAuthHeader = req.getHeader(HttpHeaders.AUTHORIZATION) != null;
			logger.info("Incoming request: [{}] {} (auth_header_present={})", req.getMethod(), req.getRequestURI(), hasAuthHeader);
		}
		
		chain.doFilter(request, response);
		
	}

}

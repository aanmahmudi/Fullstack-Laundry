package com.laundry.BE_Laundry.Config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class CustomLoggingFilter implements Filter {

	private static final Logger logger = LoggerFactory.getLogger(CustomLoggingFilter.class);
	
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		
		HttpServletRequest req = (HttpServletRequest) request;
		String path = req.getRequestURI();
		
		if (!req.getRequestURI().equals("/favicon.ico")) {
			logger.info("Incoming request: [{}] {}", req.getMethod(), req.getRequestURI());
		}
		
		if (!path.startsWith("/.well-known")) {
			logger.info("Incoming request: [{}]", req.getMethod(), req.getRequestURI());
		}
		
		chain.doFilter(request, response);
		
	}

}

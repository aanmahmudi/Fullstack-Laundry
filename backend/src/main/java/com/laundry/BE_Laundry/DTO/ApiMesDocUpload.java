package com.laundry.BE_Laundry.DTO;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiMesDocUpload<T> {
	private String message;
	private String status;
	private T data;
	private String errorCode;
	private Instant timestamp;
	
	public static <T> ApiMesDocUpload<T> success(String message, T data) {
        return ApiMesDocUpload.<T>builder()
                .status("success")
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiMesDocUpload<T> fail(String message, String errorCode) {
        return ApiMesDocUpload.<T>builder()
                .status("fail")
                .message(message)
                .errorCode(errorCode)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiMesDocUpload<T> error(String message) {
        return ApiMesDocUpload.<T>builder()
                .status("error")
                .message(message)
                .timestamp(Instant.now())
                .build();
    }
}


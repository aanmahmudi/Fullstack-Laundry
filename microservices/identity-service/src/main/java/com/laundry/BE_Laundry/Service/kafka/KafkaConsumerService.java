package com.laundry.BE_Laundry.Service.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.laundry.BE_Laundry.DTO.EmailEventDTO;
import com.laundry.BE_Laundry.Service.email.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerService {

    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "laundry-email-events", groupId = "laundry-group")
    public void handleEmailEvent(String message) {
        try {
            EmailEventDTO event = objectMapper.readValue(message, EmailEventDTO.class);
            log.info("Received email event: {}", event);

            switch (event.getType()) {
                case "OTP":
                    emailService.sendOTPEmail(event.getTo(), event.getOtp());
                    break;
                case "VERIFICATION":
                    emailService.sendVerificationLink(event.getTo(), event.getToken());
                    break;
                default:
                    log.warn("Unknown email event type: {}", event.getType());
            }
        } catch (Exception e) {
            log.error("Failed to process email event: {}", message, e);
        }
    }
}

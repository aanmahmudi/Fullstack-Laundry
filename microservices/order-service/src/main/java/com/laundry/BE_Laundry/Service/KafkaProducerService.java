package com.laundry.BE_Laundry.Service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.laundry.BE_Laundry.DTO.EmailEventDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private static final String TOPIC_EMAIL = "laundry-email-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendEmailEvent(EmailEventDTO event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC_EMAIL, message);
            log.info("Email event sent to Kafka: {}", event);
        } catch (Exception e) {
            log.error("Failed to send email event to Kafka", e);
        }
    }
}

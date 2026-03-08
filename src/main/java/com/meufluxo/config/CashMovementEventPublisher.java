package com.meufluxo.config;

import com.meufluxo.dto.cashMovement.CashMovementEventDto;
import org.springframework.stereotype.Component;

@Component
public class CashMovementEventPublisher {
    private final KafkaTemplate<String, CashMovementEventDto> kafkaTemplate;

    public CashMovementEventPublisher(KafkaTemplate<String, CashMovementEventDto> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(String topic, String key, CashMovementEventDto event) {
        kafkaTemplate.send(topic, key, event);
    }
}

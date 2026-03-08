package com.meufluxo.config;

import com.meufluxo.messaging.events.CashMovementEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class CashMovementEventPublisher {
    private final KafkaTemplate<String, CashMovementEvent> kafkaTemplate;

    public CashMovementEventPublisher(KafkaTemplate<String, CashMovementEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(String topic, String key, CashMovementEvent event) {
        kafkaTemplate.send(topic, key, event);
    }
}

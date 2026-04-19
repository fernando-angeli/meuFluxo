package com.meufluxo.config;

import com.meufluxo.messaging.events.CashMovementEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class CashMovementEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(CashMovementEventPublisher.class);

    private final KafkaTemplate<String, CashMovementEvent> kafkaTemplate;

    public CashMovementEventPublisher(KafkaTemplate<String, CashMovementEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(String topic, String key, CashMovementEvent event) {
        try {
            kafkaTemplate.send(topic, key, event);
        } catch (Exception ex) {
            // Evento é best-effort: não deve impedir persistência de movimento e liquidação.
            log.warn("Falha ao publicar evento de movimento. topic={}, key={}, movementId={}",
                    topic,
                    key,
                    event != null ? event.movementId() : null,
                    ex
            );
        }
    }
}

package com.meufluxo.account.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class AccountMovementPublisher {

    private static final Logger log = LoggerFactory.getLogger(AccountMovementPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public AccountMovementPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void apply(Long movementId, Long accountId, String movementType, BigDecimal amount, String originType) {
        publish(RabbitMQConfig.RK_APPLY, buildCommand("APPLY", movementId, accountId, movementType, amount, originType));
    }

    public void revert(Long movementId, Long accountId, String movementType, BigDecimal amount, String originType) {
        publish(RabbitMQConfig.RK_REVERT, buildCommand("REVERT", movementId, accountId, movementType, amount, originType));
    }

    private void publish(String routingKey, AccountMovementCommand command) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, routingKey, command);
            log.info("Comando publicado | commandId={} commandType={} accountId={} amount={} originMovementId={}",
                    command.commandId(), command.commandType(), command.accountId(),
                    command.amount(), command.originMovementId());
        } catch (Exception ex) {
            // best-effort: falha na publicação não deve reverter a transação principal
            log.warn("Falha ao publicar comando de movimento | commandId={} commandType={} accountId={} error={}",
                    command.commandId(), command.commandType(), command.accountId(), ex.getMessage(), ex);
        }
    }

    private AccountMovementCommand buildCommand(
            String commandType,
            Long movementId,
            Long accountId,
            String movementType,
            BigDecimal amount,
            String originType
    ) {
        return new AccountMovementCommand(
                UUID.randomUUID().toString(),
                commandType,
                accountId,
                amount,
                movementType,
                movementId,
                originType,
                LocalDateTime.now()
        );
    }
}

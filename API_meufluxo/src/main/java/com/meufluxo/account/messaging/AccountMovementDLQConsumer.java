package com.meufluxo.account.messaging;

import com.meufluxo.account.messaging.AccountMovementCommand;
import com.meufluxo.account.messaging.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class AccountMovementDLQConsumer {

    private static final Logger log = LoggerFactory.getLogger(AccountMovementDLQConsumer.class);

    @RabbitListener(queues = RabbitMQConfig.QUEUE_DLQ)
    public void handle(AccountMovementCommand command) {
        log.error("Comando na DLQ — requer revisão manual | commandId={} commandType={} accountId={} amount={} originMovementId={} originType={} issuedAt={}",
                command.commandId(),
                command.commandType(),
                command.accountId(),
                command.amount(),
                command.originMovementId(),
                command.originType(),
                command.issuedAt());
    }
}

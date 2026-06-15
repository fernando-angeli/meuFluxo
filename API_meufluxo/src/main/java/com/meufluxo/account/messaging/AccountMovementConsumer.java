package com.meufluxo.account.messaging;

import com.meufluxo.account.model.Account;
import com.meufluxo.account.repository.AccountRepository;
import com.meufluxo.account.messaging.AccountMovementCommand;
import com.meufluxo.account.messaging.RabbitMQConfig;
import com.meufluxo.cashmovement.model.MovementType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class AccountMovementConsumer {

    private static final Logger log = LoggerFactory.getLogger(AccountMovementConsumer.class);

    private final AccountRepository accountRepository;

    public AccountMovementConsumer(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void handle(AccountMovementCommand command) {
        log.info("Processando comando | commandId={} commandType={} accountId={} amount={} originType={}",
                command.commandId(), command.commandType(), command.accountId(),
                command.amount(), command.originType());

        Account account = accountRepository.findById(command.accountId())
                .orElseThrow(() -> {
                    log.error("Conta não encontrada, rejeitando para DLQ | commandId={} accountId={}",
                            command.commandId(), command.accountId());
                    return new AmqpRejectAndDontRequeueException(
                            "Conta não encontrada: " + command.accountId());
                });

        MovementType movementType;
        try {
            movementType = MovementType.valueOf(command.movementType());
        } catch (IllegalArgumentException ex) {
            log.error("MovementType inválido, rejeitando para DLQ | commandId={} movementType={}",
                    command.commandId(), command.movementType());
            throw new AmqpRejectAndDontRequeueException("MovementType inválido: " + command.movementType());
        }

        switch (command.commandType()) {
            case "APPLY"  -> applyMovement(command, account, movementType);
            case "REVERT" -> revertMovement(command, account, movementType);
            default -> {
                log.error("CommandType desconhecido, rejeitando para DLQ | commandId={} commandType={}",
                        command.commandId(), command.commandType());
                throw new AmqpRejectAndDontRequeueException("CommandType desconhecido: " + command.commandType());
            }
        }

        accountRepository.save(account);

        log.info("Saldo atualizado | commandId={} commandType={} accountId={} balanceAfter={}",
                command.commandId(), command.commandType(), account.getId(), account.getCurrentBalance());
    }

    private void applyMovement(AccountMovementCommand command, Account account, MovementType movementType) {
        if (movementType == MovementType.EXPENSE) {
            BigDecimal available = nvl(account.getCurrentBalance()).add(nvl(account.getOverdraftLimit()));
            if (command.amount().compareTo(available) > 0) {
                log.warn("Saldo insuficiente, rejeitando para DLQ | commandId={} accountId={} available={} requested={}",
                        command.commandId(), account.getId(), available, command.amount());
                throw new AmqpRejectAndDontRequeueException(
                        "Saldo insuficiente | accountId=" + account.getId()
                                + " available=" + available
                                + " requested=" + command.amount());
            }
            account.debit(command.amount().abs());
        } else {
            account.credit(command.amount().abs());
        }
    }

    private void revertMovement(AccountMovementCommand command, Account account, MovementType movementType) {
        // reverter EXPENSE = creditar; reverter INCOME = debitar
        if (movementType == MovementType.EXPENSE) {
            account.credit(command.amount().abs());
        } else {
            account.debit(command.amount().abs());
        }
    }

    private BigDecimal nvl(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}

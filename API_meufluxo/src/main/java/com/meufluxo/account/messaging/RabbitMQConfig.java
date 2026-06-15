package com.meufluxo.account.messaging;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "meufluxo.financial";
    public static final String EXCHANGE_DLQ = "meufluxo.financial.dlq";
    public static final String QUEUE = "account.movement.commands";
    public static final String QUEUE_DLQ = "account.movement.commands.dlq";
    public static final String RK_APPLY = "account.movement.apply";
    public static final String RK_REVERT = "account.movement.revert";
    public static final String RK_DLQ = "account.movement.dead";

    // durable=true → sobrevive a restart do broker
    @Bean
    public TopicExchange financialExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE).durable(true).build();
    }

    @Bean
    public TopicExchange financialDlqExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE_DLQ).durable(true).build();
    }

    @Bean
    public Queue movementCommandsQueue() {
        return QueueBuilder
                .durable(QUEUE)
                .withArgument("x-dead-letter-exchange", EXCHANGE_DLQ)
                .withArgument("x-dead-letter-routing-key", RK_DLQ)
                // mensagem expira após 7 dias sem consumo (7 * 24 * 60 * 60 * 1000)
                .withArgument("x-message-ttl", 604_800_000)
                .build();
    }

    @Bean
    public Queue movementCommandsDlqQueue() {
        // DLQ simples — sem DLQ própria para não criar loop infinito
        return QueueBuilder.durable(QUEUE_DLQ).build();
    }

    @Bean
    public Binding bindApply(Queue movementCommandsQueue, TopicExchange financialExchange) {
        return BindingBuilder.bind(movementCommandsQueue).to(financialExchange).with(RK_APPLY);
    }

    @Bean
    public Binding bindRevert(Queue movementCommandsQueue, TopicExchange financialExchange) {
        return BindingBuilder.bind(movementCommandsQueue).to(financialExchange).with(RK_REVERT);
    }

    @Bean
    public Binding bindDlq(Queue movementCommandsDlqQueue, TopicExchange financialDlqExchange) {
        return BindingBuilder.bind(movementCommandsDlqQueue).to(financialDlqExchange).with(RK_DLQ);
    }

}

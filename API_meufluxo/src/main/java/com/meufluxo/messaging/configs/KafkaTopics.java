package com.meufluxo.messaging.configs;

public final class KafkaTopics {
    private KafkaTopics(){}

    public static final String CASH_MOVEMENT_CREATED = "cash-movement.created";
    public static final String CASH_MOVEMENT_UPDATED = "cash-movement.updated";
    public static final String CASH_MOVEMENT_DELETED = "cash-movement.deleted";

}

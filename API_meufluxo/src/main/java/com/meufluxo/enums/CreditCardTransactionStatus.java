package com.meufluxo.enums;

public enum CreditCardTransactionStatus {
    ACTIVE("Ativa"),
    CANCELED("Cancelada"),
    REVERSED("Revertida");

    private final String labelPtBr;

    CreditCardTransactionStatus(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

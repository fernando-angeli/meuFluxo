package com.meufluxo.enums;

public enum CreditCardExpenseStatus {
    OPEN("Em aberto"),
    CANCELED("Cancelada");

    private final String labelPtBr;

    CreditCardExpenseStatus(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

package com.meufluxo.account.model;

public enum AccountType {

    CHECKING("Conta corrente"),
    CREDIT_CARD("Cartão de crédito"),
    CASH ("Dinheiro"),
    INVESTMENT("Investimentos"),
    SAVING("Poupança"),
    BENEFIT_CARD("VA / VR");

    private final String labelPtBr;

    AccountType(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}


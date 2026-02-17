package com.meufluxo.enums;

public enum AccountType {

    CHECKING("Conta corrente"),
    CREDIT_CARD("Cartão de crédito"),
    CASH ("Dinheiro"),
    INVESTMENT("Investimentos"),
    SAVING("Poupança"),
    BENEFIT_CARD("Vale alimentação ou refeição");

    private final String labelPtBr;

    AccountType(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}


package com.meufluxo.enums;

public enum CreditCardInstallmentStatus {
    OPEN("Aberta"),
    INVOICED("Na fatura"),
    PAID("Paga"),
    CANCELED("Cancelada");

    private final String labelPtBr;

    CreditCardInstallmentStatus(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

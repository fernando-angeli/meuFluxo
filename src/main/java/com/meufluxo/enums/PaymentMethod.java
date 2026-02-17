package com.meufluxo.enums;

public enum PaymentMethod {

    CREDIT_CARD("Cartão de Crédito"),
    DEBIT_CARD("Cartão de Débito"),
    DEBIT("Débito em conta"),
    PIX("PIX"),
    BOLETO("Boleto"),
    CASH("Dinheiro"),
    TRANSFER("Transferência"),
    VA("Vale Alimentação");

    private final String labelPtBr;

    PaymentMethod(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

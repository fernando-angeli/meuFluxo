package com.meufluxo.enums;

public enum PaymentMethod {

    PIX("PIX"),
    DEBIT("Débito em conta"),
    CASH("Dinheiro"),
    TRANSFER("Transferência"),
    BOLETO("Boleto"),
    VA("Vale Alimentação"),
    INVOICE_CREDIT_CARD("Fatura de cartão de crédito");

    private final String labelPtBr;

    PaymentMethod(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

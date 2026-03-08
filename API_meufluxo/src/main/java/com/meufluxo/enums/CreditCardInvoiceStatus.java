package com.meufluxo.enums;

public enum CreditCardInvoiceStatus {
    OPEN("Aberta"),
    CLOSED("Fechada"),
    PAID("Paga"),
    PARTIALLY_PAID("Pagamento parcial"),
    OVERDUE("Atrasada");

    private final String labelPtBr;

    CreditCardInvoiceStatus(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

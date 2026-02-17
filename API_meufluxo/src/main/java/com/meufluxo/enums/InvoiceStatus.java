package com.meufluxo.enums;

public enum InvoiceStatus {
    OPEN("Aberta"),
    CLOSED("Fechada"),
    PAID("Paga");

    private final String labelPtBr;

    InvoiceStatus(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

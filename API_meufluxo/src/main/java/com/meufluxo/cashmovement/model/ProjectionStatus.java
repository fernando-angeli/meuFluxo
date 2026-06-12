package com.meufluxo.cashmovement.model;

public enum ProjectionStatus {
    PENDING("Pendente"),
    PAID("Pago"),
    CANCELED("Cancelado");

    private final String labelPtBr;

    ProjectionStatus(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

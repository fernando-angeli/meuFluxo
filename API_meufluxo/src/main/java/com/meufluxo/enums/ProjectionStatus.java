package com.meufluxo.enums;

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

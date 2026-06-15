package com.meufluxo.cashmovement.model;

public enum MovementType {
    INCOME("Receita"),
    EXPENSE("Despesa");

    private final String labelPtBr;

    MovementType(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

package com.meufluxo.enums;

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

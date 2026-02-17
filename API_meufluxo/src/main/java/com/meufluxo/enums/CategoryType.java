package com.meufluxo.enums;

public enum CategoryType {
    INCOME("Receita"),
    EXPENSE("Despesa");

    private final String labelPtBr;

    CategoryType(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

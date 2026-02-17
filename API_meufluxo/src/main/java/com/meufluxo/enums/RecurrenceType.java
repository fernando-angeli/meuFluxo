package com.meufluxo.enums;

public enum RecurrenceType {
    WEEKLY("Semanal"),
    BIWEEKLY("Quinzenal"),
    MONTHLY("Mensal"),
    BIMONTHLY("Bimestral"),
    QUARTERLY("Trimestral"),
    YEARLY("Anual");

    private final String labelPtBr;

    RecurrenceType(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}

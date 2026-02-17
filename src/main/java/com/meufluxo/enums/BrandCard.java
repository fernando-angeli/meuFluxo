package com.meufluxo.enums;

public enum BrandCard {

    VISA("Visa"),
    MASTERCARD("Masters");

    private final String labelPtBr;

    BrandCard(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}


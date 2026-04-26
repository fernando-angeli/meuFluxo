package com.meufluxo.enums;

public enum BrandCard {

    VISA("Visa"),
    MASTERCARD("Mastercard"),
    ELO("Elo"),
    AMERICAN_EXPRESS("American Express"),
    HIPERCARD("Hipercard"),
    DINERS_CLUB("Diners Club"),
    DISCOVER("Discover"),
    BANRICOMPRAS("Banricompras"),
    CABAL("Cabal"),
    AURA("Aura"),
    JCB("JCB"),
    UNIONPAY("UnionPay"),
    OUTRO("Outro");

    private final String labelPtBr;

    BrandCard(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}


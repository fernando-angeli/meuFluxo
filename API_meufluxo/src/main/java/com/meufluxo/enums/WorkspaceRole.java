package com.meufluxo.enums;

public enum WorkspaceRole {

    OWNER("Gestor"),
    ADMIN("Administrador"),
    MEMBER ("Membro");

    private final String labelPtBr;

    WorkspaceRole(String labelPtBr) {
        this.labelPtBr = labelPtBr;
    }

    public String getLabelPtBr() {
        return labelPtBr;
    }
}


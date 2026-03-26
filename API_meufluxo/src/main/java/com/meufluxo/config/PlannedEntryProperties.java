package com.meufluxo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "meufluxo.planned-entry")
public class PlannedEntryProperties {

    /**
     * Limite de meses para geração manual em lote no MVP.
     */
    private int maxBatchMonths = 24;

    public int getMaxBatchMonths() {
        return maxBatchMonths;
    }

    public void setMaxBatchMonths(int maxBatchMonths) {
        this.maxBatchMonths = maxBatchMonths;
    }
}

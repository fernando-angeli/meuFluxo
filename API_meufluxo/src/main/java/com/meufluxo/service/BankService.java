package com.meufluxo.service;

import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.dto.bank.BankResponse;
import com.meufluxo.dto.bank.BrasilApiBankResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class BankService {

    private static final String BANKS_API_URL = "https://brasilapi.com.br/api/banks/v1";
    private static final Duration CACHE_TTL = Duration.ofHours(12);

    private final RestClient restClient;

    private volatile List<BankResponse> cachedBanks = List.of();
    private volatile Instant cacheExpiresAt = Instant.EPOCH;

    public BankService() {
        this.restClient = RestClient.create();
    }

    @Transactional(readOnly = true)
    public List<BankResponse> getBanks() {
        Instant now = Instant.now();
        if (now.isBefore(cacheExpiresAt) && !cachedBanks.isEmpty()) {
            return cachedBanks;
        }

        synchronized (this) {
            Instant currentNow = Instant.now();
            if (currentNow.isBefore(cacheExpiresAt) && !cachedBanks.isEmpty()) {
                return cachedBanks;
            }

            BrasilApiBankResponse[] response;
            try {
                response = restClient
                        .get()
                        .uri(BANKS_API_URL)
                        .retrieve()
                        .body(BrasilApiBankResponse[].class);
            } catch (RestClientException exception) {
                throw new BusinessException("Não foi possível consultar bancos no momento.");
            }

            List<BankResponse> refreshedBanks = mapBanks(response);
            cachedBanks = refreshedBanks;
            cacheExpiresAt = currentNow.plus(CACHE_TTL);
            return refreshedBanks;
        }
    }

    @Transactional(readOnly = true)
    private List<BankResponse> mapBanks(BrasilApiBankResponse[] response) {
        if (response == null || response.length == 0) {
            return List.of();
        }

        return Arrays.stream(response)
                .filter(bank -> bank != null && bank.code() != null && bank.name() != null)
                .map(ba
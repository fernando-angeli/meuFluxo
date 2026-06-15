package com.meufluxo.planning.dto;

import java.util.UUID;

public record PlannedEntryFutureOpenUpdateResponse(
        UUID groupId,
        int updatedCount
) {
}

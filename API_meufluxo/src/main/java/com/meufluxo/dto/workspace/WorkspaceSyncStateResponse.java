package com.meufluxo.dto.workspace;

import java.time.LocalDateTime;

public record WorkspaceSyncStateResponse(
        Long workspaceId,
        Long categoriesVersion,
        Long subCategoriesVersion,
        Long accountsVersion,
        Long creditCardsVersion,
        LocalDateTime updatedAt
) {
}

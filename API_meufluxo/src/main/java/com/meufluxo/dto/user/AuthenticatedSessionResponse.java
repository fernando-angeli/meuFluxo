package com.meufluxo.dto.user;

import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.dto.category.CategoryResponse;
import com.meufluxo.dto.creditCard.CreditCardResponse;
import com.meufluxo.dto.subCategory.SubCategoryResponse;
import com.meufluxo.dto.workspace.WorkspaceSyncStateResponse;

import java.util.List;

public record AuthenticatedSessionResponse(
        Long id,
        String name,
        String email,
        UserPreferenceResponse preferences,
        WorkspaceSummaryResponse activeWorkspace,
        List<UserWorkspaceResponse> workspaces,
        List<CategoryResponse> categories,
        List<SubCategoryResponse> subCategories,
        List<AccountResponse> accounts,
        List<CreditCardResponse> creditCards,
        WorkspaceSyncStateResponse syncState
) {
}

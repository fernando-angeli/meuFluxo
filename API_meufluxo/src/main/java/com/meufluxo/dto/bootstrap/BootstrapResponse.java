package com.meufluxo.dto.bootstrap;

import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.dto.category.CategoryResponse;
import com.meufluxo.dto.creditCard.CreditCardResponse;
import com.meufluxo.dto.subCategory.SubCategoryResponse;
import com.meufluxo.dto.user.UserPreferenceResponse;
import com.meufluxo.dto.user.UserWorkspaceResponse;
import com.meufluxo.dto.user.WorkspaceSummaryResponse;
import com.meufluxo.dto.workspace.WorkspaceSyncStateResponse;

import java.util.List;

public record BootstrapResponse(
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

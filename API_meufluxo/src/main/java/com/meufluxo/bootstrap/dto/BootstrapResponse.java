package com.meufluxo.bootstrap.dto;

import com.meufluxo.account.dto.AccountResponse;
import com.meufluxo.category.dto.CategoryResponse;
import com.meufluxo.creditcard.dto.CreditCardResponse;
import com.meufluxo.category.dto.SubCategoryResponse;
import com.meufluxo.workspace.dto.UserPreferenceResponse;
import com.meufluxo.workspace.dto.UserWorkspaceResponse;
import com.meufluxo.workspace.dto.WorkspaceSummaryResponse;
import com.meufluxo.workspace.dto.WorkspaceSyncStateResponse;

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

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useAuthOptional } from "@/hooks/useAuth";
import {
  accountsQueryKey,
  useDeleteAccount,
} from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import type { Account, AccountId } from "@meufluxo/types";
import { AccountModal } from "@/features/accounts/components/account-modal";
import { AccountRowActions } from "@/features/accounts/components/account-row-actions";
import { AccountsTable } from "@/components/accounts";
import { getAccountsTableColumns } from "@/features/accounts/accounts.columns";
import { fetchAccountsPage } from "@/features/accounts/accounts.service";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { getQueryErrorMessage } from "@/lib/query-error";

export default function AccountsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const auth = useAuthOptional();
  const { success, error } = useToast();

  const currency = (auth?.preferences?.currency as "BRL" | "USD" | "EUR") ?? "BRL";

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);
  const [selectedAccountId, setSelectedAccountId] = React.useState<AccountId | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingAccount, setDeletingAccount] = React.useState<Account | null>(null);

  const deleteMutation = useDeleteAccount();

  const [search, setSearch] = React.useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const accountsTable = useServerDataTable<Account>({
    queryKey: accountsQueryKey,
    fetchPage: fetchAccountsPage,
    initialPageSize: 20,
    initialSortKey: "name",
    initialDirection: "asc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });

  const pageResponse = accountsTable.pageResponseQuery.data ?? null;

  React.useEffect(() => {
    accountsTable.onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedSearch]);

  const filteredAccounts = React.useMemo(() => {
    const accounts = pageResponse?.content ?? [];
    if (!normalizedSearch) return accounts;
    return accounts.filter((a) => a.name.toLowerCase().includes(normalizedSearch));
  }, [pageResponse, normalizedSearch]);

  const errorMessage = accountsTable.pageResponseQuery.isError
    ? getQueryErrorMessage(
        accountsTable.pageResponseQuery.error,
        "Não foi possível carregar as contas.",
      )
    : null;

  const openCreateModal = React.useCallback(() => {
    setEditingAccount(null);
    setModalOpen(true);
  }, []);

  const openManager = React.useCallback((account: Account) => {
    router.push(`/accounts/${encodeURIComponent(account.id)}`);
  }, [router]);

  const openEditModal = React.useCallback((account: Account) => {
    setEditingAccount(account);
    setModalOpen(true);
  }, []);

  const renderActions = React.useCallback(
    (account: Account) => (
      <AccountRowActions
        account={account}
        onOpenManager={openManager}
        onEdit={(acc) => {
          openEditModal(acc);
        }}
        onDelete={(acc) => {
          setDeletingAccount(acc);
          setDeleteOpen(true);
        }}
        isDeleting={deleteMutation.isPending && deletingAccount?.id === account.id}
      />
    ),
    [deleteMutation.isPending, deletingAccount?.id, openEditModal, openManager],
  );

  const columns = React.useMemo(
    () => getAccountsTableColumns({ currency, renderActions }),
    [currency, renderActions],
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={t("pages.accounts.title")}
          description="Gerencie as contas utilizadas nas movimentações do sistema."
          right={
            <Button className="gap-2" variant="default" onClick={openCreateModal}>
              <Plus className="h-4 w-4" />
              Nova conta
            </Button>
          }
        />

        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Lista</CardTitle>
              <div className="w-full max-w-sm">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome..."
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <AccountsTable
              columns={columns}
              data={filteredAccounts}
              loading={accountsTable.pageResponseQuery.isLoading}
              error={errorMessage}
              pageResponse={pageResponse}
              sortState={{
                sortKey: accountsTable.sortKey,
                direction: accountsTable.direction,
              }}
              onSortChange={accountsTable.onSortChange}
              onPageChange={accountsTable.onPageChange}
              onPageSizeChange={accountsTable.onPageSizeChange}
              onRowClick={openManager}
            />
          </CardContent>
        </Card>
      </div>

      <AccountModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        account={editingAccount}
        currency={currency}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir conta"
        description="Tem certeza que deseja excluir esta conta?"
        cancelText="Cancelar"
        confirmText="Confirmar"
        confirmVariant="destructive"
        isConfirming={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deletingAccount) return;
          try {
            await deleteMutation.mutateAsync(deletingAccount.id);
            success("Conta excluída com sucesso");
            if (selectedAccountId === deletingAccount.id) {
              setSelectedAccountId(null);
            }
          } catch {
            error("Não foi possível excluir a conta");
          } finally {
            setDeletingAccount(null);
          }
        }}
      />
    </>
  );
}


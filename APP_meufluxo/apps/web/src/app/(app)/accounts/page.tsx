"use client";

import * as React from "react";
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
import type { Account } from "@meufluxo/types";
import { AccountModal } from "@/features/accounts/components/account-modal";
import { AccountRowActions } from "@/features/accounts/components/account-row-actions";
import { DataTable } from "@/components/data-table/DataTable";
import { getAccountsTableColumns } from "@/features/accounts/accounts.columns";
import { fetchAccountsPage } from "@/features/accounts/accounts.service";
import { useServerDataTable } from "@/hooks/useServerDataTable";

export default function AccountsPage() {
  const { t } = useTranslation();
  const auth = useAuthOptional();
  const { success, error } = useToast();

  const currency = (auth?.preferences?.currency as "BRL" | "USD" | "EUR") ?? "BRL";

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);

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
  const accounts = pageResponse?.content ?? [];

  React.useEffect(() => {
    accountsTable.onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedSearch]);

  const filteredAccounts = React.useMemo(() => {
    if (!normalizedSearch) return accounts;
    return accounts.filter((a) => a.name.toLowerCase().includes(normalizedSearch));
  }, [accounts, normalizedSearch]);

  const errorMessage = React.useMemo(() => {
    if (!accountsTable.pageResponseQuery.isError) return null;
    const err = accountsTable.pageResponseQuery.error as unknown;
    if (
      err &&
      typeof err === "object" &&
      "message" in err &&
      typeof (err as { message?: unknown }).message === "string"
    ) {
      return (err as { message: string }).message;
    }
    return "Não foi possível carregar as contas.";
  }, [accountsTable.pageResponseQuery.isError, accountsTable.pageResponseQuery.error]);

  const openCreateModal = React.useCallback(() => {
    setEditingAccount(null);
    setModalOpen(true);
  }, []);

  const renderActions = React.useCallback(
    (account: Account) => (
      <AccountRowActions
        account={account}
        onEdit={(acc) => {
          setEditingAccount(acc);
          setModalOpen(true);
        }}
        onDelete={(acc) => {
          setDeletingAccount(acc);
          setDeleteOpen(true);
        }}
        isDeleting={deleteMutation.isPending && deletingAccount?.id === account.id}
      />
    ),
    [deleteMutation.isPending, deletingAccount?.id],
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
            <DataTable
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
              onRowClick={(acc) => {
                setEditingAccount(acc);
                setModalOpen(true);
              }}
              getRowKey={(acc) => acc.id}
              emptyTitle={t("pages.accounts.noAccounts")}
              emptyDescription="Nenhuma conta cadastrada para este workspace."
              pageSizeOptions={[10, 20, 50]}
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


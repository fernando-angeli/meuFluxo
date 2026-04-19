"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import type { Bank } from "@meufluxo/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionLoadingState } from "@/components/patterns";
import { useBanks } from "@/hooks/api";
import { cn } from "@/lib/utils";

function formatBankLabel(bank: Pick<Bank, "code" | "name">) {
  return `[${bank.code}] ${bank.name}`;
}

export function BankSelect({
  id,
  label = "Banco",
  value,
  onChange,
  disabled,
  error,
  enabled = true,
}: {
  id?: string;
  label?: string;
  value: { code: string; name: string } | null;
  onChange: (next: Bank | null) => void;
  disabled?: boolean;
  error?: boolean;
  /** Carrega lista apenas quando true (ex.: tipo CHECKING). */
  enabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const banksQuery = useBanks(enabled);

  const banks = banksQuery.data ?? [];
  const q = search.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!q) return banks;
    return banks.filter(
      (b) => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q),
    );
  }, [banks, q]);

  const selectedLabel = value?.code && value?.name ? formatBankLabel(value as Bank) : null;

  return (
    <div className="space-y-2">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || banksQuery.isLoading}
            className={cn(
              "h-10 w-full justify-between rounded-xl font-normal",
              error && "border-destructive focus-visible:ring-destructive",
            )}
          >
            <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
              {selectedLabel ?? "Buscar banco por nome ou código..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          {banksQuery.isLoading ? (
            <div className="p-3">
              <SectionLoadingState message="Carregando bancos..." />
            </div>
          ) : banksQuery.isError ? (
            <p className="p-3 text-sm text-destructive">Não foi possível carregar a lista de bancos.</p>
          ) : (
            <div className="flex flex-col">
              <div className="border-b p-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome ou código..."
                  className="h-9"
                  autoComplete="off"
                />
              </div>
              <ScrollArea className="h-[min(280px,40vh)]">
                <div className="p-1">
                  {filtered.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                      Nenhum banco encontrado.
                    </p>
                  ) : (
                    filtered.map((bank) => {
                      const isSelected = value?.code === bank.code && value?.name === bank.name;
                      return (
                        <button
                          key={`${bank.code}-${bank.name}`}
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted/80",
                            isSelected && "bg-muted",
                          )}
                          onClick={() => {
                            onChange(bank);
                            setOpen(false);
                            setSearch("");
                          }}
                        >
                          <Check
                            className={cn("h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")}
                            aria-hidden
                          />
                          <span className="min-w-0 truncate">{formatBankLabel(bank)}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
              {value ? (
                <div className="border-t p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => {
                      onChange(null);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    Limpar seleção
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

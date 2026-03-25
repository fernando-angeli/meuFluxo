"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Category, MovementType } from "@meufluxo/types";
import { TRANSACTION_MOVEMENT_TYPE_LABELS } from "@meufluxo/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { FormFieldError } from "@/components/form";
import { FormDialogShell } from "@/components/patterns";
import { useToast } from "@/components/toast";
import {
  extractApiError,
  getInputErrorClass,
  mapApiFieldErrors,
} from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { useCreateCategory, useUpdateCategory } from "@/hooks/api";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/features/categories/category-form.schema";

export type CategoryFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` = nova categoria; caso contrário edição. */
  category: Category | null;
};

/**
 * Modal de criação/edição de categoria (cadastro pai; filhos via painel expandido).
 */
export function CategoryFormModal({ open, onOpenChange, category }: CategoryFormModalProps) {
  const { success, error } = useToast();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const clearFieldError = React.useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const isEdit = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      movementType: "EXPENSE",
      active: true,
    },
  });

  const active = form.watch("active");
  const movementType = form.watch("movementType");

  React.useEffect(() => {
    if (!open) return;

    setFieldErrors({});
    setGeneralError(null);

    if (category) {
      form.reset({
        name: category.name ?? "",
        movementType: category.movementType as MovementType,
        active: !!category.meta.active,
      });
    } else {
      form.reset({
        name: "",
        movementType: "EXPENSE",
        active: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category?.id]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFieldErrors({});
    setGeneralError(null);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: category!.id,
          request: { name: values.name.trim(), active: values.active },
        });
        success("Categoria atualizada com sucesso");
      } else {
        const created = await createMutation.mutateAsync({
          name: values.name.trim(),
          movementType: values.movementType,
        });
        if (!values.active) {
          await updateMutation.mutateAsync({
            id: String(created.id),
            request: { name: values.name.trim(), active: values.active },
          });
        }
        success("Categoria criada com sucesso");
      }
      onOpenChange(false);
    } catch (err) {
      const apiError = extractApiError(err);

      if (apiError?.errors?.length) {
        setFieldErrors(mapApiFieldErrors(apiError.errors));
      } else {
        const message = apiError?.detail ?? "Ocorreu um erro ao salvar.";
        setGeneralError(message);
        error(message);
      }
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar categoria" : "Nova categoria"}
      description={
        isEdit
          ? "Altere o nome ou o status da categoria. O tipo de movimentação não pode ser alterado."
          : "Defina nome e tipo (receita ou despesa). As subcategorias são geridas ao expandir a linha na lista."
      }
      generalError={generalError}
      contentClassName="max-w-xl"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="category-form-name">Nome</Label>
          <Input
            id="category-form-name"
            placeholder="Ex.: Moradia"
            autoComplete="off"
            className={cn(
              getInputErrorClass(
                fieldErrors.name ?? form.formState.errors.name?.message,
              ),
            )}
            {...form.register("name", {
              onChange: () => clearFieldError("name"),
            })}
          />
          <FormFieldError
            message={fieldErrors.name ?? form.formState.errors.name?.message}
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de movimentação</Label>
          <Select
            value={movementType}
            disabled={isEdit || isSubmitting}
            onValueChange={(value) => {
              form.setValue("movementType", value as MovementType, {
                shouldDirty: true,
              });
              clearFieldError("movementType");
            }}
          >
            <SelectTrigger
              className={cn("h-10", getInputErrorClass(fieldErrors.movementType))}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">
                {TRANSACTION_MOVEMENT_TYPE_LABELS.INCOME}
              </SelectItem>
              <SelectItem value="EXPENSE">
                {TRANSACTION_MOVEMENT_TYPE_LABELS.EXPENSE}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormFieldError message={fieldErrors.movementType} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label>Categoria ativa</Label>
              <p className="text-xs text-muted-foreground">
                {active
                  ? "Visível nas seleções do workspace."
                  : "Inativa permanece no histórico, mas pode ser oculta em filtros."}
              </p>
            </div>

            <Switch
              checked={active}
              disabled={isSubmitting}
              onCheckedChange={(checked) => {
                form.setValue("active", checked);
                clearFieldError("active");
              }}
              aria-label="Categoria ativa"
            />
          </div>
          <FormFieldError message={fieldErrors.active} />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Salvando..."
              : isEdit
                ? "Salvar alterações"
                : "Criar categoria"}
          </Button>
        </DialogFooter>
      </form>
    </FormDialogShell>
  );
}

"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Category, SubCategory } from "@meufluxo/types";
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
import { useCreateSubcategory, useUpdateSubcategory } from "@/hooks/api";
import {
  subcategoryFormSchema,
  type SubcategoryFormValues,
} from "@/features/categories/subcategory-form.schema";

export type SubcategoryFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentCategory: Category;
  /** `null` = nova subcategoria na categoria pai. */
  subcategory: SubCategory | null;
};

export function SubcategoryFormModal({
  open,
  onOpenChange,
  parentCategory,
  subcategory,
}: SubcategoryFormModalProps) {
  const { success, error } = useToast();
  const createMutation = useCreateSubcategory();
  const updateMutation = useUpdateSubcategory();

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

  const isEdit = !!subcategory;

  const form = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategoryFormSchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });

  const active = form.watch("active");

  React.useEffect(() => {
    if (!open) return;

    setFieldErrors({});
    setGeneralError(null);

    if (subcategory) {
      form.reset({
        name: subcategory.name ?? "",
        active: !!subcategory.meta.active,
      });
    } else {
      form.reset({
        name: "",
        active: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, subcategory?.id]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFieldErrors({});
    setGeneralError(null);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: subcategory!.id,
          request: {
            name: values.name.trim(),
            active: values.active,
          },
        });
        success("Subcategoria atualizada com sucesso");
      } else {
        await createMutation.mutateAsync({
          name: values.name.trim(),
          categoryId: Number(parentCategory.id),
        });
        success("Subcategoria criada com sucesso");
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
      title={isEdit ? "Editar subcategoria" : "Nova subcategoria"}
      descriptionClassName="space-y-1"
      description={
        <>
          <span className="block">
            Categoria pai:{" "}
            <span className="font-medium text-foreground">{parentCategory.name}</span>
          </span>
          <span className="text-muted-foreground">
            {isEdit
              ? "Ajuste o nome ou o status. O tipo segue o da categoria pai."
              : "O tipo de movimentação será o mesmo da categoria pai."}
          </span>
        </>
      }
      generalError={generalError}
      contentClassName="max-w-md"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="subcat-name">Nome</Label>
          <Input
            id="subcat-name"
            placeholder="Ex.: Supermercado"
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

        {isEdit ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>Ativa</Label>
                <p className="text-xs text-muted-foreground">
                  Subcategorias inativas podem ser ocultadas em filtros.
                </p>
              </div>
              <Switch
                checked={active}
                disabled={isSubmitting}
                onCheckedChange={(checked) => {
                  form.setValue("active", checked);
                  clearFieldError("active");
                }}
                aria-label="Subcategoria ativa"
              />
            </div>
            <FormFieldError message={fieldErrors.active} />
          </div>
        ) : null}

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
            {isSubmitting ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </form>
    </FormDialogShell>
  );
}

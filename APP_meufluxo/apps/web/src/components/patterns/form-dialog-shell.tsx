"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { FormModalAlert } from "./form-modal-alert";

export type FormDialogShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  descriptionClassName?: string;
  /** Erro geral (ex.: detail da API) exibido acima do corpo do formulário. */
  generalError?: string | null;
  children: React.ReactNode;
  contentClassName?: string;
  showClose?: boolean;
};

/**
 * Estrutura comum de modal de formulário: cabeçalho + alerta opcional + corpo (ex.: &lt;form&gt;).
 * Mantém consistência entre cadastros (categorias, subcategorias, contas, futuros pai-filho).
 */
export function FormDialogShell({
  open,
  onOpenChange,
  title,
  description,
  descriptionClassName,
  generalError,
  children,
  contentClassName,
  showClose = true,
}: FormDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(contentClassName)} showClose={showClose}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description != null ? (
            <DialogDescription className={descriptionClassName}>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="space-y-4">
          {generalError ? <FormModalAlert message={generalError} /> : null}
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

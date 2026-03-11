import { AlertCircle, Inbox, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BaseProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function LoadingState({ title = "Carregando dados", description, className }: BaseProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-10 text-center text-sm", className)}>
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      <div className="font-medium text-muted-foreground">{title}</div>
      {description && <p className="max-w-sm text-xs text-muted-foreground/80">{description}</p>}
    </div>
  );
}

export function EmptyState({
  title = "Nenhum registro encontrado",
  description = "Assim que você começar a lançar seus dados, eles aparecerão aqui.",
  className,
  action,
}: BaseProps & { action?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-10 text-center text-sm", className)}>
      <Inbox className="h-5 w-5 text-muted-foreground" />
      <div className="font-medium text-muted-foreground">{title}</div>
      {description && <p className="max-w-sm text-xs text-muted-foreground/80">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar os dados",
  description = "Ocorreu um erro ao comunicar com o servidor. Tente novamente em instantes.",
  className,
  onRetry,
}: BaseProps & { onRetry?: () => void }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-10 text-center text-sm", className)}>
      <AlertCircle className="h-5 w-5 text-destructive" />
      <div className="font-medium text-destructive">{title}</div>
      {description && <p className="max-w-sm text-xs text-muted-foreground/80">{description}</p>}
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}


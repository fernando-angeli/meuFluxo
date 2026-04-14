"use client";

import { useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

import { CardsModuleNav } from "@/components/credit-cards";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toNumericIdString } from "@/lib/numeric-id";

export default function CardsClosingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const creditCardId = toNumericIdString(searchParams.get("creditCardId"));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fechamento"
        description="Área operacional para fechamento de faturas de cartão."
        right={<CardsModuleNav />}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fechamento de faturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            A gestão de fechamento utiliza a listagem de faturas com ações por linha. Abra a
            tela já filtrada para iniciar o fechamento.
          </p>
          <div>
            <Button
              type="button"
              className="gap-2"
              onClick={() => {
                const query = new URLSearchParams();
                query.set("status", "OPEN");
                if (creditCardId) query.set("creditCardId", creditCardId);
                router.push(`/invoices?${query.toString()}`);
              }}
            >
              <Filter className="h-4 w-4" />
              Abrir faturas para fechamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

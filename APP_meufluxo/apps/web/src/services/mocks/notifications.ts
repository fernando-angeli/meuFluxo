import type { Notification } from "@meufluxo/types";

export const mockNotifications: Notification[] = [
  {
    id: "not_1",
    workspaceId: "ws_1",
    title: "Fatura perto do vencimento",
    message: "A fatura do cartão Nubank vence em 3 dias.",
    channel: "IN_APP",
    status: "UNREAD",
    createdAt: new Date().toISOString(),
  },
  {
    id: "not_2",
    workspaceId: "ws_1",
    title: "Pendência em aberto",
    message: "Você tem 1 despesa agendada sem conta definida.",
    channel: "IN_APP",
    status: "READ",
    createdAt: new Date().toISOString(),
    readAt: new Date().toISOString(),
  },
];


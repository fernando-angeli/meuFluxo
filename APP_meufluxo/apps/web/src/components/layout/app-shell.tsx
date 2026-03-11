import * as React from "react";

import {
  SidebarProvider,
  AppSidebar,
  SidebarDrawer,
} from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-dvh bg-muted/30">
        <div className="flex">
          <AppSidebar className="hidden shrink-0 lg:flex" />
          <SidebarDrawer />
          <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 p-3 lg:p-6">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}


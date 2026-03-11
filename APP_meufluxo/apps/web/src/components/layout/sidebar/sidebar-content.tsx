"use client";

import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-nav";
import { SidebarFooter } from "./sidebar-footer";

/** Conteúdo da sidebar (header + nav + footer) para uso em AppSidebar e no drawer mobile. */
export function SidebarContent() {
  return (
    <>
      <SidebarHeader />
      <SidebarNav />
      <SidebarFooter />
    </>
  );
}

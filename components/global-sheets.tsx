"use client";

import { useDashboardStore } from "@/stores/dashboard-store";
import { NewCustomerSheet } from "@/components/new-customer-sheet";

export function GlobalSheets() {
  const { newCustomerSheetOpen, setNewCustomerSheetOpen } = useDashboardStore();

  return (
    <NewCustomerSheet
      open={newCustomerSheetOpen}
      onOpenChange={setNewCustomerSheetOpen}
    />
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { CreditCard, Receipt } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { DataTable, DataTableToolbar } from "@/components/data-table";
import { ListEmptyState } from "@/components/list-empty-state";
import { columns } from "./columns";
import { usePayments } from "@/hooks/use-payments";
import { useListPagination } from "@/hooks/use-list-pagination";
import { ListPagination } from "@/components/list-pagination";
import { EMPTY_LIST_ITEMS, syncRangeFilters } from "@/lib/paginated-list";
import { paymentMethodLabels } from "@/types/payment";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export default function PaymentsPage() {
  const setHeader = useDashboardStore((state) => state.setHeader);
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [rangeFilters, setRangeFilters] = useState<
    Record<string, [number, number]>
  >({});

  const { page, limit, setPage } = useListPagination();
  const { data: paymentsResult, isLoading } = usePayments({ page, limit });
  const payments = paymentsResult?.items ?? EMPTY_LIST_ITEMS;
  const pagination = paymentsResult?.pagination;

  useEffect(() => {
    setHeader({
      title: "Payments",
      description: "Manage all customer payments",
      showBreadcrumbs: false,
      showButton: false,
    });
  }, [setHeader]);

  // Generate dynamic filters based on data
  const dynamicFilters = useMemo(() => {
    if (!payments.length) return [];

    // Get unique payment methods from data
    const methods = [...new Set(payments.map((p) => p.method))];

    // Get min/max amounts for range filter
    const amounts = payments.map((p) => parseFloat(p.amount));
    const minAmount = Math.floor(Math.min(...amounts) / 100) * 100;
    const maxAmount = Math.ceil(Math.max(...amounts) / 100) * 100;

    return [
      {
        key: "method",
        label: "Payment Method",
        options: methods.map((method) => ({
          value: method,
          label: paymentMethodLabels[method] || method,
        })),
      },
      {
        key: "amount",
        label: "Amount Range",
        type: "range" as const,
        min: minAmount || 0,
        max: maxAmount || 10000,
        step: 50,
        formatValue: (v: number) => `£${v.toLocaleString()}`,
      },
    ];
  }, [payments]);

  useEffect(() => {
    setRangeFilters((prev) => syncRangeFilters(prev, dynamicFilters));
  }, [dynamicFilters]);

  const handleFilterChange = (key: string, values: string[]) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  const handleRangeFilterChange = (key: string, values: [number, number]) => {
    setRangeFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  // Filter data based on active tab and filters
  const filteredData = useMemo(() => {
    let data = payments;

    // Tab filter
    if (activeTab !== "all") {
      data = data.filter((payment) => payment.status === activeTab);
    }

    // Method filter
    if (activeFilters.method?.length) {
      data = data.filter((payment) =>
        activeFilters.method.includes(payment.method)
      );
    }

    // Amount range filter
    const amountRange = rangeFilters.amount;
    if (amountRange) {
      data = data.filter((payment) => {
        const amount = parseFloat(payment.amount);
        return amount >= amountRange[0] && amount <= amountRange[1];
      });
    }

    return data;
  }, [activeTab, activeFilters, rangeFilters, payments]);

  // Search filter
  const searchFilteredData = useMemo(() => {
    if (!searchValue) return filteredData;
    const search = searchValue.toLowerCase();
    return filteredData.filter(
      (payment) =>
        payment.id.toLowerCase().includes(search) ||
        (payment.transactionId &&
          payment.transactionId.toLowerCase().includes(search)) ||
        (payment.customerName &&
          payment.customerName.toLowerCase().includes(search)) ||
        (payment.customerEmail &&
          payment.customerEmail.toLowerCase().includes(search))
    );
  }, [filteredData, searchValue]);

  if (isLoading) {
    return (
      <div className="space-y-4 px-3 md:px-5 pb-3 md:pb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-3 md:px-5 pb-3 md:pb-4">
      <DataTableToolbar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search transactions..."
        layoutId="activePaymentTab"
        filters={dynamicFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        rangeFilters={rangeFilters}
        onRangeFilterChange={handleRangeFilterChange}
      />
      {searchFilteredData.length === 0 ? (
        <ListEmptyState
          icon={CreditCard}
          badgeIcon={Receipt}
          title={activeTab === "all" ? "No payments yet" : `No ${activeTab} payments`}
          description={
            activeTab === "all"
              ? "Payments will appear here once customers make payments."
              : `No payments with "${activeTab}" status found.`
          }
          footer={
            activeTab === "all" ? (
              <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#14213d]" />
                  Card
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C5D5EB]" />
                  Bank Transfer
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff8c32]" />
                  Cash
                </span>
              </div>
            ) : undefined
          }
        />
      ) : (
        <DataTable columns={columns} data={searchFilteredData} showPagination={false} />
      )}

      {pagination && (
        <ListPagination
          pagination={pagination}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

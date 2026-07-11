"use client";

import { useState, useEffect, useMemo } from "react";
import { Package, ClipboardList } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { DataTableToolbar } from "@/components/data-table";
import { ListEmptyState } from "@/components/list-empty-state";
import { OrderCard } from "./order-card";
import { useOrders } from "@/hooks/use-orders";
import { useListPagination } from "@/hooks/use-list-pagination";
import { ListPagination } from "@/components/list-pagination";
import { EMPTY_LIST_ITEMS, syncRangeFilters } from "@/lib/paginated-list";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
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
  const { data: ordersResult, isLoading } = useOrders({ page, limit });
  const orders = ordersResult?.items ?? EMPTY_LIST_ITEMS;
  const pagination = ordersResult?.pagination;

  useEffect(() => {
    setHeader({
      title: "Orders",
      description: "Manage all customer orders",
      showBreadcrumbs: false,
      showButton: false,
    });
  }, [setHeader]);

  // Generate dynamic filters based on data
  const dynamicFilters = useMemo(() => {
    if (!orders.length) return [];

    // Get min/max amounts for range filter
    const amounts = orders.map((o) => parseFloat(o.quoteTotal));
    const minAmount = Math.floor(Math.min(...amounts) / 100) * 100;
    const maxAmount = Math.ceil(Math.max(...amounts) / 100) * 100;

    // Get unique assignees
    const assignees = [
      ...new Set(orders.map((o) => o.assigneeName).filter(Boolean)),
    ] as string[];

    const filters = [
      {
        key: "amount",
        label: "Amount Range",
        type: "range" as const,
        min: minAmount || 0,
        max: maxAmount || 10000,
        step: 100,
        formatValue: (v: number) => `£${v.toLocaleString()}`,
      },
      ...(assignees.length > 0
        ? [
            {
              key: "assignee",
              label: "Assignee",
              options: assignees.map((name) => ({
                value: name,
                label: name,
              })),
            },
          ]
        : []),
      {
        key: "hasNotes",
        label: "Notes",
        options: [
          { value: "yes", label: "Has Notes" },
          { value: "no", label: "No Notes" },
        ],
      },
    ];

    return filters;
  }, [orders]);

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
    let data = orders;

    // Tab filter
    if (activeTab !== "all") {
      data = data.filter((order) => order.status === activeTab);
    }

    // Amount range filter
    const amountRange = rangeFilters.amount;
    if (amountRange) {
      data = data.filter((order) => {
        const amount = parseFloat(order.quoteTotal);
        return amount >= amountRange[0] && amount <= amountRange[1];
      });
    }

    // Assignee filter
    if (activeFilters.assignee?.length) {
      data = data.filter(
        (order) =>
          order.assigneeName &&
          activeFilters.assignee.includes(order.assigneeName)
      );
    }

    // Notes filter
    if (activeFilters.hasNotes?.length) {
      data = data.filter((order) => {
        const hasNotes = !!order.notes;
        return activeFilters.hasNotes.some((value) => {
          if (value === "yes") return hasNotes;
          if (value === "no") return !hasNotes;
          return false;
        });
      });
    }

    return data;
  }, [activeTab, activeFilters, rangeFilters, orders]);

  // Search filter
  const searchFilteredData = useMemo(() => {
    if (!searchValue) return filteredData;
    const search = searchValue.toLowerCase();
    return filteredData.filter(
      (order) =>
        (order.quoteTitle &&
          order.quoteTitle.toLowerCase().includes(search)) ||
        order.orderNumber.toLowerCase().includes(search) ||
        (order.customerName &&
          order.customerName.toLowerCase().includes(search)) ||
        (order.customerEmail &&
          order.customerEmail.toLowerCase().includes(search))
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
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
        searchPlaceholder="Search orders..."
        layoutId="activeOrderTab"
        filters={dynamicFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        rangeFilters={rangeFilters}
        onRangeFilterChange={handleRangeFilterChange}
      />
      {searchFilteredData.length === 0 ? (
        <ListEmptyState
          icon={Package}
          badgeIcon={ClipboardList}
          title={
            activeTab === "all"
              ? "No orders yet"
              : `No ${activeTab.replace("_", " ")} orders`
          }
          description={
            activeTab === "all"
              ? "Orders will appear here once customers pay for quotes."
              : `No orders with "${activeTab.replace("_", " ")}" status found.`
          }
          footer={
            activeTab === "all" ? (
              <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#E8EEF7] flex items-center justify-center text-[10px] font-medium text-[#14213d]">1</span>
                  Quote Created
                </span>
                <span className="w-4 h-px bg-[#C5D5EB]" />
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#E8EEF7] flex items-center justify-center text-[10px] font-medium text-[#14213d]">2</span>
                  Customer Pays
                </span>
                <span className="w-4 h-px bg-[#C5D5EB]" />
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#E8EEF7] flex items-center justify-center text-[10px] font-medium text-[#14213d]">3</span>
                  Order Created
                </span>
              </div>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {searchFilteredData.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
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

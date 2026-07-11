"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { DataTableToolbar } from "@/components/data-table";
import { ListEmptyState } from "@/components/list-empty-state";
import { QuoteCard } from "./quote-card";
import { useQuotes } from "@/hooks/use-quotes";
import { useListPagination } from "@/hooks/use-list-pagination";
import { ListPagination } from "@/components/list-pagination";
import { EMPTY_LIST_ITEMS, syncRangeFilters } from "@/lib/paginated-list";
import type { QuoteStatus } from "@/types/quote";

const tabs = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "deposit_paid", label: "Deposit Paid" },
  { value: "paid", label: "Fully Paid" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

export default function QuotesPage() {
  const router = useRouter();
  const setHeader = useDashboardStore((state) => state.setHeader);
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [rangeFilters, setRangeFilters] = useState<
    Record<string, [number, number]>
  >({});

  // Fetch quotes from API (server-paginated)
  const { page, limit, setPage } = useListPagination();
  const { data: quotesResult, isLoading } = useQuotes({ page, limit });
  const quotes = quotesResult?.items ?? EMPTY_LIST_ITEMS;
  const pagination = quotesResult?.pagination;

  useEffect(() => {
    setHeader({
      title: "Quotes",
      description: "All you required info in one place",
      showBreadcrumbs: false,
      button: {
        label: "New",
        onClick: () => router.push("/quotes/new"),
      },
      showButton: true,
    });
  }, [setHeader, router]);

  // Generate dynamic filters based on data
  const dynamicFilters = useMemo(() => {
    // Get unique customers from data
    const customers = [
      ...new Set(quotes.map((q) => q.customerName).filter(Boolean)),
    ] as string[];

    // Get min/max amounts for range filter
    const amounts = quotes.map((q) => parseFloat(q.total || "0"));
    const minAmount = amounts.length
      ? Math.floor(Math.min(...amounts) / 100) * 100
      : 0;
    const maxAmount = amounts.length
      ? Math.ceil(Math.max(...amounts) / 100) * 100
      : 10000;

    return [
      {
        key: "amount",
        label: "Amount Range",
        type: "range" as const,
        min: minAmount,
        max: maxAmount || 10000,
        step: 100,
        formatValue: (v: number) => `£${v.toLocaleString()}`,
      },
      {
        key: "customer",
        label: "Customer",
        options: customers.map((name) => ({
          value: name,
          label: name,
        })),
      },
    ];
  }, [quotes]);

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
    let data = quotes;

    // Tab filter
    if (activeTab !== "all") {
      data = data.filter((quote) => quote.status === (activeTab as QuoteStatus));
    }

    // Amount range filter
    const amountRange = rangeFilters.amount;
    if (amountRange) {
      data = data.filter((quote) => {
        const amount = parseFloat(quote.total || "0");
        return amount >= amountRange[0] && amount <= amountRange[1];
      });
    }

    // Customer filter
    if (activeFilters.customer?.length) {
      data = data.filter(
        (quote) =>
          quote.customerName &&
          activeFilters.customer.includes(quote.customerName)
      );
    }

    return data;
  }, [quotes, activeTab, activeFilters, rangeFilters]);

  // Search filter
  const searchFilteredData = useMemo(() => {
    if (!searchValue) return filteredData;
    const search = searchValue.toLowerCase();
    return filteredData.filter(
      (quote) =>
        (quote.customerName?.toLowerCase() || "").includes(search) ||
        (quote.invoiceNumber?.toLowerCase() || "").includes(search) ||
        (quote.title?.toLowerCase() || "").includes(search)
    );
  }, [filteredData, searchValue]);

  return (
    <div className="space-y-4 px-3 md:px-5 pb-3 md:pb-4">
      <DataTableToolbar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search quotes..."
        layoutId="activeQuoteTab"
        filters={dynamicFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        rangeFilters={rangeFilters}
        onRangeFilterChange={handleRangeFilterChange}
      />
      {isLoading ? (
        <div className="flex flex-wrap gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-[200px] h-[280px] bg-gray-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : searchFilteredData.length === 0 ? (
        <ListEmptyState
          icon={FileText}
          title={quotes.length === 0 ? "No quotes yet" : "No quotes found"}
          description={
            quotes.length === 0
              ? "Create your first quote to get started. You can generate quotes from customer requests or create them directly."
              : "Try adjusting your search or filter criteria to find what you're looking for."
          }
          action={
            quotes.length === 0 ? (
              <button
                onClick={() => router.push("/quotes/new")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14213d] text-white text-sm font-medium rounded-lg hover:bg-[#1a2d52] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Quote
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-wrap gap-4">
          {searchFilteredData.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
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

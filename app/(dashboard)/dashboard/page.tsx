"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/stores/dashboard-store";
import { StatsCard } from "@/components/dashboard/stats-card";
import { MiniStatCard } from "@/components/dashboard/mini-stat-card";
import { ResponseTimeCard } from "@/components/dashboard/response-time-card";
import { DataTable } from "@/components/data-table";
import { createColumns } from "../requests/columns";
import { useRequests } from "@/hooks/use-requests";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import QuoteDetailsSheet from "@/components/dashboard/quote-details-sheet";
import type { DateRange } from "@/types/dashboard";

/**
 * Format currency value for display
 */
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

/**
 * Format response time for display
 */
function formatResponseTime(hours: number | null): string {
  if (hours === null) return "N/A";
  if (hours < 1) return "<1hr";
  if (hours < 24) return `${Math.round(hours)}hr`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

export default function OverviewPage() {
  const router = useRouter();
  const setHeader = useDashboardStore((state) => state.setHeader);
  const { data: requestsResult, isLoading: requestsLoading } = useRequests();
  const requests = requestsResult?.items ?? [];

  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const { data: stats, isLoading: statsLoading } = useDashboardStats(dateRange);

  // Sheet state
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleViewDetails = useCallback((requestId: string) => {
    setSelectedRequestId(requestId);
    setIsSheetOpen(true);
  }, []);

  const handleCreateQuote = useCallback((requestId: string) => {
    setIsSheetOpen(false);
    router.push(`/quotes/new/create?requestId=${requestId}`);
  }, [router]);

  const columns = useMemo(() => createColumns(handleViewDetails), [handleViewDetails]);

  useEffect(() => {
    setHeader({
      title: "Overview",
      description: "All your required info in one place",
      showBreadcrumbs: false,
      button: { label: "New" },
      showButton: true,
    });
  }, [setHeader]);

  // Get recent requests (last 5)
  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6 px-3 md:px-5 pb-3 md:pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Quotes Stats */}
        <StatsCard
          title="Quotes"
          mainValue={stats?.quotes.total ?? 0}
          mainLabel="in total"
          secondaryTitle="Value"
          secondaryValue={formatCurrency(stats?.quotes.totalValue ?? 0)}
          secondaryLabel="generated so far"
          filterValue={dateRange}
          onFilterChange={setDateRange}
          isLoading={statsLoading}
          stats={[
            { label: "Open Quotes", value: stats?.quotes.open ?? 0 },
            { label: "Closed Quotes", value: stats?.quotes.closed ?? 0 },
            { label: "Rejected Quotes", value: stats?.quotes.rejected ?? 0 },
          ]}
        />

        {/* Right Column */}
        <div className="grid grid-rows-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <MiniStatCard
              title="Customers"
              value={stats?.customers.total ?? 0}
              isLoading={statsLoading}
              delay={0.1}
            />
            <MiniStatCard
              title="Pending requests"
              value={stats?.requests.pending ?? 0}
              isLoading={statsLoading}
              delay={0.15}
            />
          </div>

          <ResponseTimeCard
            title="Avg. response time"
            value={formatResponseTime(stats?.avgResponseTime ?? null)}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Requests Table */}
      <DataTable
        columns={columns}
        data={recentRequests}
        isLoading={requestsLoading}
      />

      {/* Quote Details Sheet */}
      <QuoteDetailsSheet
        requestId={selectedRequestId}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onCreateQuote={handleCreateQuote}
      />
    </div>
  );
}

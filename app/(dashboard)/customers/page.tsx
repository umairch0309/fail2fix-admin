"use client";

import { useState, useEffect, useMemo } from "react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { DataTable, DataTableToolbar } from "@/components/data-table";
import { columns } from "./columns";
import { useCustomers } from "@/hooks/use-customers";
import { useListPagination } from "@/hooks/use-list-pagination";
import { ListPagination } from "@/components/list-pagination";
import { Loader2 } from "lucide-react";

const tabs = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];

export default function CustomersPage() {
  const { setHeader, setNewCustomerSheetOpen } = useDashboardStore();
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const { page, limit, setPage } = useListPagination();
  const { data: customersResult, isLoading, error } = useCustomers({
    page,
    limit,
  });
  const customers = customersResult?.items ?? [];
  const pagination = customersResult?.pagination;

  useEffect(() => {
    setHeader({
      title: "Customers",
      description: "All you required info in one place",
      showBreadcrumbs: false,
      button: {
        label: "New",
        onClick: () => setNewCustomerSheetOpen(true),
      },
      showButton: true,
    });
  }, [setHeader, setNewCustomerSheetOpen]);

  // Generate dynamic filters based on data
  const dynamicFilters = useMemo(() => {
    // Get unique locations (cities) from data
    const cities = [...new Set(customers.map((c) => c.city).filter(Boolean))] as string[];
    const states = [...new Set(customers.map((c) => c.state).filter(Boolean))] as string[];

    const filters = [];

    if (cities.length > 0) {
      filters.push({
        key: "city",
        label: "City",
        options: cities.map((city) => ({
          value: city,
          label: city,
        })),
      });
    }

    if (states.length > 0) {
      filters.push({
        key: "state",
        label: "State",
        options: states.map((state) => ({
          value: state,
          label: state,
        })),
      });
    }

    return filters;
  }, [customers]);

  const handleFilterChange = (key: string, values: string[]) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  // Filter data based on active tab and filters
  const filteredData = useMemo(() => {
    let data = customers;

    // Tab filter
    if (activeTab === "active") {
      data = data.filter((customer) => customer.banned !== true);
    } else if (activeTab === "banned") {
      data = data.filter((customer) => customer.banned === true);
    }

    // City filter
    if (activeFilters.city?.length) {
      data = data.filter((customer) =>
        customer.city && activeFilters.city.includes(customer.city)
      );
    }

    // State filter
    if (activeFilters.state?.length) {
      data = data.filter((customer) =>
        customer.state && activeFilters.state.includes(customer.state)
      );
    }

    return data;
  }, [activeTab, activeFilters, customers]);

  // Search filter
  const searchFilteredData = useMemo(() => {
    if (!searchValue) return filteredData;
    const search = searchValue.toLowerCase();
    return filteredData.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search)
    );
  }, [filteredData, searchValue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load customers</p>
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
        searchPlaceholder="Search customers..."
        layoutId="activeCustomerTab"
        filters={dynamicFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />
      <DataTable
        columns={columns}
        data={searchFilteredData}
        showPagination={false}
      />

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

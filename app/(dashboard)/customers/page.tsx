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

  const filteredData = useMemo(() => {
    if (activeTab === "active") {
      return customers.filter((customer) => customer.banned !== true);
    }
    if (activeTab === "banned") {
      return customers.filter((customer) => customer.banned === true);
    }
    return customers;
  }, [activeTab, customers]);

  const searchFilteredData = useMemo(() => {
    if (!searchValue) return filteredData;
    const search = searchValue.toLowerCase();
    return filteredData.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search),
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

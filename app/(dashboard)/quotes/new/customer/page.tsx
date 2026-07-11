"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Plus, Search } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useQuoteStore } from "@/stores/quote-store";
import { useCustomers } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/custombutton";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { NewCustomerSheet } from "@/components/new-customer-sheet";
import type { Customer } from "@/types/customer";

const steps = [
  { number: 1, label: "Select a Request", completed: true, skipped: true },
  { number: 2, label: "Select Customer" },
  { number: 3, label: "Create Quote" },
];

export default function SelectCustomerPage() {
  const router = useRouter();
  const setHeader = useDashboardStore((state) => state.setHeader);
  const storeCustomer = useQuoteStore((state) => state.customer);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    storeCustomer?.id || null
  );
  const [searchValue, setSearchValue] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  // Fetch customers from API
  const { data: customersResult, isLoading } = useCustomers();
  const customers = customersResult?.items ?? [];

  useEffect(() => {
    setHeader({
      title: "",
      description: "",
      breadcrumbs: [
        { label: "Quotes", href: "/quotes" },
        { label: "New Quote", href: "/quotes/new" },
        { label: "Select Customer" },
      ],
      showBreadcrumbs: true,
      showButton: false,
    });
  }, [setHeader]);

  const handleContinue = () => {
    if (selectedCustomerId) {
      router.push(`/quotes/new/create?customerId=${selectedCustomerId}`);
    }
  };

  const handleBack = () => {
    router.push("/quotes/new");
  };

  // Filter customers based on search (client-side for immediate feedback)
  const filteredCustomers = useMemo(() => {
    if (!searchValue.trim()) return customers;
    const search = searchValue.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search)
    );
  }, [customers, searchValue]);

  return (
    <div className="flex flex-col min-h-full bg-[#F8F8F8] border-t border-[#EBEBEB]">
      {/* Step Indicator & Continue Button */}
      <div className="flex items-center justify-between px-3 md:px-5 py-4">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isCurrentStep = index + 1 === 2;
            const isCompleted = step.completed && !step.skipped;
            const isClickable = step.completed || isCurrentStep;

            return (
              <div key={step.number} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (step.number === 1 && step.skipped) {
                      router.push("/quotes/new");
                    } else if (step.number === 3 && selectedCustomerId) {
                      router.push(`/quotes/new/create?customerId=${selectedCustomerId}`);
                    }
                  }}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.skipped
                        ? "bg-[#E5E7EB] text-[#6B7280]"
                        : isCompleted
                        ? "bg-[#ff8c32] text-white"
                        : isCurrentStep
                        ? "bg-[#ff8c32] text-white"
                        : "bg-[#F5F5F5] text-[#97999D]"
                    }`}
                  >
                    {step.completed ? (
                      step.skipped ? (
                        <span className="text-xs">-</span>
                      ) : (
                        <Check className="h-4 w-4" />
                      )
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isCurrentStep || isCompleted
                        ? "text-[#494F57]"
                        : "text-[#97999D]"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-12 h-px bg-[#EAEAEA] mx-3" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="rounded-full h-10 w-[100px] border-[#D1D5DB] text-[#494F57] shadow-none"
          >
            Back
          </Button>
          <CustomButton
            onClick={handleContinue}
            disabled={!selectedCustomerId}
            normalColor={!selectedCustomerId ? "#EFE2DD" : "#ff8c32"}
            textColor={!selectedCustomerId ? "#B09388" : "white"}
            style={{ opacity: 1 }}
          >
            <ArrowRight className="h-5 w-5" strokeWidth={2} color={!selectedCustomerId ? "#B09388" : "white"} />
            Continue
          </CustomButton>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#EAEAEA]" />

      {/* Content Area */}
      <div className="flex-1 px-3 md:px-5 py-4">
        {/* Search and Create New */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#97999D]" />
            <Input
              placeholder="Search customers..."
              className="pl-9 h-10 bg-white border-[#EAEAEA] rounded-lg"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="rounded-full px-4 border-[#ff8c32] text-[#ff8c32] hover:bg-[#FFF8F3]"
            onClick={() => setShowNewCustomer(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Customer
          </Button>
        </div>

        {/* Customer List */}
        <div className="rounded-2xl border border-[#E0E0E0] overflow-hidden">
          <div className="divide-y divide-[#E8E8E8]">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedCustomerId === customer.id}
                  onSelect={() => setSelectedCustomerId(customer.id)}
                />
              ))
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[#97999D]">
                No customers found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Customer Sheet */}
      <NewCustomerSheet
        open={showNewCustomer}
        onOpenChange={setShowNewCustomer}
        onSuccess={(customer) => {
          // Auto-select the newly created customer
          setSelectedCustomerId(customer.id);
        }}
      />
    </div>
  );
}

function CustomerRow({
  customer,
  isSelected,
  onSelect,
}: {
  customer: Customer;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const formattedDate = new Date(customer.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors ${
        isSelected ? "bg-[#F0F0F0]" : "bg-[#FAFAFA] hover:bg-[#F5F5F5]"
      }`}
      onClick={onSelect}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          isSelected
            ? "border-[#ff8c32] bg-[#ff8c32]"
            : "border-[#C4C4C4] bg-white"
        }`}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>

      <UserAvatar id={customer.id} name={customer.name} size="md" />

      <div className="flex-1 min-w-0">
        <div className="font-medium text-[#494F57]">{customer.name}</div>
        <div className="text-sm text-[#81868C]">{customer.email}</div>
      </div>

      <div className="text-sm text-[#81868C]">Joined {formattedDate}</div>

      <div
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
          customer.emailVerified
            ? "bg-[#FBFFF4] text-[#395214] border-[#B3EC3D]"
            : "bg-[#EFEFEF] text-[#81868C] border-[#D1D5DB]"
        }`}
      >
        {customer.emailVerified ? "Verified" : "Unverified"}
      </div>
    </div>
  );
}

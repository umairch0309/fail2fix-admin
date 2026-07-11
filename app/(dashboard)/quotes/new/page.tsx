"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, Check } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useQuoteStore } from "@/stores/quote-store";
import { useRequests } from "@/hooks/use-requests";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/custombutton";
import { UserAvatar } from "@/components/user-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Request, RequestStatus } from "@/types/request";
import { requestStatusConfig } from "@/types/request";

const steps = [
  { number: 1, label: "Select a Request" },
  { number: 2, label: "Create Quote" },
];

export default function NewQuotePage() {
  const router = useRouter();
  const setHeader = useDashboardStore((state) => state.setHeader);
  const storeRequestId = useQuoteStore((state) => state.requestId);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    storeRequestId || null
  );
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch requests - only show those with quote_requested status
  const { data: requestsResult, isLoading } = useRequests();
  const requests = requestsResult?.items ?? [];

  // Filter to only show quote_requested status
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => r.status === "quote_requested");
  }, [requests]);

  useEffect(() => {
    setHeader({
      title: "",
      description: "",
      breadcrumbs: [
        { label: "Quotes", href: "/quotes" },
        { label: "New Quote", href: "/quotes/new" },
        { label: "Select Request" },
      ],
      showBreadcrumbs: true,
      showButton: false,
    });
  }, [setHeader]);

  const handleContinue = () => {
    if (selectedRequestId && currentStep === 1) {
      // Navigate to step 2 (Create Quote) with the selected request
      router.push(`/quotes/new/create?requestId=${selectedRequestId}`);
    }
  };

  const handleViewRequest = (requestId: string) => {
    router.push(`/requests/details/${requestId}`);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F8F8F8] border-t border-[#EBEBEB]">
      {/* Step Indicator & Continue Button */}
      <div className="flex items-center justify-between px-3 md:px-5 py-4">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (step.number === 2 && selectedRequestId) {
                    router.push(`/quotes/new/create?requestId=${selectedRequestId}`);
                  }
                }}
                disabled={currentStep < step.number}
                className={`flex items-center gap-2 ${currentStep >= step.number ? "cursor-pointer" : "cursor-default"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.number
                      ? "bg-[#ff8c32] text-white"
                      : currentStep > step.number
                      ? "bg-[#ff8c32] text-white"
                      : "bg-[#F5F5F5] text-[#97999D]"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep === step.number
                      ? "text-[#494F57]"
                      : currentStep > step.number
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
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/quotes/new/customer")}
            className="rounded-full h-10 w-[100px] border-[#D1D5DB] text-[#494F57] shadow-none"
          >
            Skip
          </Button>
          <CustomButton
            onClick={handleContinue}
            disabled={!selectedRequestId}
            normalColor={!selectedRequestId ? "#EFE2DD" : "#ff8c32"}
            textColor={!selectedRequestId ? "#B09388" : "white"}
            style={{ opacity: 1 }}
          >
            <ArrowRight className="h-5 w-5" strokeWidth={2} color={!selectedRequestId ? "#B09388" : "white"} />
            Continue
          </CustomButton>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#EAEAEA]" />

      {/* Content Area */}
      <div className="flex-1 px-3 md:px-5 py-4">
        {/* Request Selection Table */}
        <div className="rounded-2xl border border-[#EAEAEA] overflow-hidden bg-white">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] border-b border-[#EAEAEA]">
              <TableHead className="text-[#35383B] font-medium text-sm py-3 w-[50px]"></TableHead>
              <TableHead className="text-[#35383B] font-medium text-sm py-3">
                <span className="pl-2">Request Info</span>
              </TableHead>
              <TableHead className="text-[#35383B] font-medium text-sm py-3">VRM</TableHead>
              <TableHead className="text-[#35383B] font-medium text-sm py-3">Postcode</TableHead>
              <TableHead className="text-[#35383B] font-medium text-sm py-3">Requested</TableHead>
              <TableHead className="text-[#35383B] font-medium text-sm py-3">Status</TableHead>
              <TableHead className="text-[#35383B] font-medium text-sm py-3">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="border-b border-[#EAEAEA]">
                  {Array.from({ length: 7 }).map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`} className="py-4">
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  isSelected={selectedRequestId === request.id}
                  onSelect={() => setSelectedRequestId(request.id)}
                  onView={() => handleViewRequest(request.id)}
                />
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-[200px] text-center">
                  <p className="text-[#97999D]">No requests available for quotes</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}

function RequestRow({
  request,
  isSelected,
  onSelect,
  onView,
}: {
  request: Request;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
}) {
  const config = requestStatusConfig[request.status as RequestStatus];
  const formattedDate = new Date(request.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TableRow
      className={`border-b border-[#EAEAEA] cursor-pointer transition-colors ${
        isSelected ? "bg-[#FFF8F3]" : "hover:bg-[#F9F9F9]"
      }`}
      onClick={onSelect}
    >
      <TableCell className="py-4 pl-4">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? "border-[#ff8c32] bg-[#ff8c32]"
              : "border-[#D1D5DB] bg-white"
          }`}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2 pl-2">
          <UserAvatar id={request.id} name={request.customerName || request.name} size="md" />
          <div>
            <span className="font-medium text-[#494F57] block">
              {request.customerName || request.name}
            </span>
            <span className="text-xs text-[#97999D]">#{request.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <span className="text-[#97999D]">{request.vrm}</span>
      </TableCell>
      <TableCell className="py-4">
        <span className="text-[#97999D]">{request.postcode}</span>
      </TableCell>
      <TableCell className="py-4">
        <span className="text-[#97999D]">{formattedDate}</span>
      </TableCell>
      <TableCell className="py-4">
        {config && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border"
            style={{
              backgroundColor: config.bgColor,
              color: config.textColor,
              borderColor: config.borderColor,
            }}
          >
            <span
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: config.statusColor }}
            />
            {config.label}
          </div>
        )}
      </TableCell>
      <TableCell className="py-4">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-[#494F57] border-[#EAEAEA]"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

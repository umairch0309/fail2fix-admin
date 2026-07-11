"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useQuoteStore } from "@/stores/quote-store";
import { useRequest } from "@/hooks/use-requests";
import { useCustomer } from "@/hooks/use-customers";
import { useCreateQuote, useSendQuote } from "@/hooks/use-quotes";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/custombutton";
import { InvoicePreview } from "@/components/quote/invoice-preview";
import { QuoteForm } from "@/components/quote/quote-form";

const QuoteIcon = ({ color = "white" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.73 19.7C7.55 18.82 8.8 18.89 9.52 19.85L10.53 21.2C11.34 22.27 12.65 22.27 13.46 21.2L14.47 19.85C15.19 18.89 16.44 18.82 17.26 19.7C19.04 21.6 20.49 20.97 20.49 18.31V7.04C20.5 3.01 19.56 2 15.78 2H8.22C4.44 2 3.5 3.01 3.5 7.04V18.3C3.5 20.97 4.96 21.59 6.73 19.7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 7H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function CreateQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setHeader = useDashboardStore((state) => state.setHeader);
  const createQuote = useCreateQuote();
  const sendQuote = useSendQuote();

  // Quote store
  const {
    customer,
    setCustomer,
    setRequestId,
    title,
    items,
    salesTaxType,
    salesTaxValue,
    dueDate,
    notes,
    reset,
    getSubtotal,
  } = useQuoteStore();

  // Get request or customer from URL params
  const requestId = searchParams.get("requestId");
  const customerId = searchParams.get("customerId");

  // Determine if we came from a request or direct customer selection
  const isFromRequest = !!requestId;

  // Fetch request if coming from request flow
  const { data: request, isLoading: requestLoading } = useRequest(
    requestId || undefined
  );

  // Fetch customer if coming from customer flow
  const { data: fetchedCustomer, isLoading: customerLoading } = useCustomer(
    !isFromRequest ? customerId || undefined : undefined
  );

  // Steps configuration based on flow
  const steps = isFromRequest
    ? [
        { number: 1, label: "Select a Request", completed: true },
        { number: 2, label: "Create Quote", current: true },
      ]
    : [
        { number: 1, label: "Select a Request", completed: true, skipped: true },
        { number: 2, label: "Select Customer", completed: true },
        { number: 3, label: "Create Quote", current: true },
      ];

  // Initialize store with customer data (only if not already set or if different)
  useEffect(() => {
    if (request && (!customer || customer.id !== request.customerId)) {
      setRequestId(request.id);
      setCustomer({
        id: request.customerId,
        name: request.customerName || request.name,
        email: request.customerEmail || request.email,
        phone: request.phone,
      });
    } else if (fetchedCustomer && (!customer || customer.id !== fetchedCustomer.id)) {
      setCustomer({
        id: fetchedCustomer.id,
        name: fetchedCustomer.name,
        email: fetchedCustomer.email,
        phone: fetchedCustomer.phone || undefined,
        address: fetchedCustomer.address || undefined,
        city: fetchedCustomer.city || undefined,
        state: fetchedCustomer.state || undefined,
        postalCode: fetchedCustomer.postalCode || undefined,
        showAddress: fetchedCustomer.showAddress ?? true,
      });
    }
  }, [request, fetchedCustomer, customer, setCustomer, setRequestId]);


  // Set header
  useEffect(() => {
    setHeader({
      title: "",
      description: "",
      breadcrumbs: [
        { label: "Quotes", href: "/quotes" },
        { label: "New Quote", href: "/quotes/new" },
        { label: "Create Quote" },
      ],
      showBreadcrumbs: true,
      showButton: false,
    });
  }, [setHeader]);

  // Check if form is valid for sending
  const isValid = customer && items.some(
    (item) => item.description.trim() && parseFloat(item.unitPrice) > 0
  );

  // Get valid items for quote
  const getValidItems = () => items.filter(
    (item) => item.description.trim() && parseFloat(item.unitPrice) > 0
  );

  // Build quote input data
  const buildQuoteInput = () => ({
    requestId: requestId || undefined,
    customerId: customer!.id,
    title: title || undefined,
    notes: notes || undefined,
    vatRate: salesTaxType === "percentage" ? parseFloat(salesTaxValue) || 20 : 0,
    validUntil: dueDate || undefined,
    items: getValidItems().map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });

  // Save as draft (create quote without sending)
  const handleSaveDraft = async () => {
    if (!customer) return;

    const validItems = getValidItems();
    if (validItems.length === 0) return;

    try {
      await createQuote.mutateAsync(buildQuoteInput());
      reset();
      router.push("/quotes");
    } catch {
      // Error handled by mutation
    }
  };

  // Create and send quote
  const handleSendQuote = async () => {
    if (!customer) return;

    const validItems = getValidItems();
    if (validItems.length === 0) return;

    try {
      // First create the quote (as draft)
      const quote = await createQuote.mutateAsync(buildQuoteInput());

      // Then send it
      await sendQuote.mutateAsync(quote.id);

      reset();
      router.push("/quotes");
    } catch {
      // Error handled by mutation
    }
  };

  const isSaving = createQuote.isPending;
  const isSending = createQuote.isPending || sendQuote.isPending;

  const isLoading = requestLoading || customerLoading;

  return (
    <div className="h-full flex flex-col bg-[#F8F8F8] border-t border-[#EBEBEB] overflow-hidden">
      {/* Step Indicator & Send Quote Button - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 md:px-5 py-4">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isCompleted = step.completed && !step.skipped;
            const isClickable = step.completed || step.current;

            return (
              <div key={step.number} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (step.number === 1 && !step.skipped) {
                      router.push("/quotes/new");
                    } else if (step.number === 2 && step.completed) {
                      router.push("/quotes/new/customer");
                    }
                  }}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.skipped
                        ? "bg-[#E5E7EB] text-[#6B7280]"
                        : step.current
                        ? "bg-[#ff8c32] text-white"
                        : isCompleted
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
                      step.current || isCompleted
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
            onClick={handleSaveDraft}
            disabled={!isValid || isSaving || isSending}
            className="rounded-full h-10 w-[100px] border-[#D1D5DB] text-[#494F57] shadow-none disabled:opacity-50"
          >
            {isSaving && !sendQuote.isPending ? "Saving..." : "Save Draft"}
          </Button>
          <CustomButton
            onClick={handleSendQuote}
            disabled={!isValid || isSending}
            loading={isSending}
            loadingText="Sending..."
            normalColor={!isValid ? "#EFE2DD" : "#ff8c32"}
            textColor={!isValid ? "#B09388" : "white"}
            style={{ opacity: 1 }}
          >
            <QuoteIcon color={!isValid ? "#B09388" : "white"} />
            Send Quote
          </CustomButton>
        </div>
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 h-px bg-[#EAEAEA]" />

      {/* Content Area - Split Layout with Independent Scroll */}
      <div className="flex-1 flex min-h-0">
        {/* Left - Invoice Preview (scrollable) */}
        <div className="flex-[3] p-4 bg-[#F8F8F8] overflow-y-auto">
          <InvoicePreview />
        </div>

        {/* Vertical Divider */}
        <div className="flex-shrink-0 w-px bg-[#E5E5E5]" />

        {/* Right - Quote Form (scrollable) */}
        <div className="flex-[2] bg-[#F1F1F1] overflow-y-auto">
          <QuoteForm requestId={requestId} />
        </div>
      </div>
    </div>
  );
}

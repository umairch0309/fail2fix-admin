"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Reorder } from "motion/react";
import {
  ArrowLeft,
  GripVertical,
  Trash2,
  CalendarIcon,
  Loader2,
  Send,
} from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useQuote, useUpdateQuote, useSendQuote } from "@/hooks/use-quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CustomButton from "@/components/custombutton";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

interface EditableItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
}

const AddItemIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.582 4.24996V5.96412C15.582 7.08329 14.8737 7.79163 13.7545 7.79163H11.332V2.84037C11.332 2.05412 11.9766 1.41663 12.7629 1.41663C13.535 1.42371 14.2433 1.73537 14.7533 2.24537C15.2633 2.76246 15.582 3.47079 15.582 4.24996Z" stroke="#493D39" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.41797 4.95829V14.875C1.41797 15.4629 2.08381 15.7958 2.55131 15.4416L3.76255 14.535C4.04588 14.3225 4.44256 14.3508 4.69756 14.6058L5.87338 15.7887C6.14963 16.065 6.60297 16.065 6.87922 15.7887L8.06922 14.5987C8.31713 14.3508 8.7138 14.3225 8.99005 14.535L10.2013 15.4416C10.6688 15.7887 11.3346 15.4558 11.3346 14.875V2.83329C11.3346 2.05413 11.9721 1.41663 12.7513 1.41663H4.95964H4.2513C2.1263 1.41663 1.41797 2.68454 1.41797 4.24996V4.95829Z" stroke="#493D39" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.42578 7.08337H8.32161" stroke="#493D39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.375 9.03121V5.13538" stroke="#493D39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const QuoteIcon = ({ color = "white" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.73 19.7C7.55 18.82 8.8 18.89 9.52 19.85L10.53 21.2C11.34 22.27 12.65 22.27 13.46 21.2L14.47 19.85C15.19 18.89 16.44 18.82 17.26 19.7C19.04 21.6 20.49 20.97 20.49 18.31V7.04C20.5 3.01 19.56 2 15.78 2H8.22C4.44 2 3.5 3.01 3.5 7.04V18.3C3.5 20.97 4.96 21.59 6.73 19.7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 7H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;
  const setHeader = useDashboardStore((state) => state.setHeader);

  const { data: quote, isLoading } = useQuote(quoteId);
  const updateQuote = useUpdateQuote();
  const sendQuote = useSendQuote();

  // Form state
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<EditableItem[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [vatRate, setVatRate] = useState("20");
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form with quote data
  useEffect(() => {
    if (quote && !isInitialized) {
      // Redirect if quote is paid (cannot be edited)
      if (quote.status === "paid") {
        router.replace(`/quotes/${quoteId}`);
        return;
      }

      setTitle(quote.title || "");
      setItems(
        quote.items.length > 0
          ? quote.items.map((item) => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }))
          : [{ id: generateId(), description: "", quantity: 1, unitPrice: "" }]
      );
      setDueDate(quote.validUntil || "");
      setVatRate(quote.vatRate || "20");
      setIsInitialized(true);
    }
  }, [quote, isInitialized, router, quoteId]);

  useEffect(() => {
    setHeader({
      title: "",
      description: "",
      breadcrumbs: [
        { label: "Quotes", href: "/quotes" },
        { label: quote?.invoiceNumber || "Quote", href: `/quotes/${quoteId}` },
        { label: "Edit" },
      ],
      showBreadcrumbs: true,
      showButton: false,
    });
  }, [setHeader, quote?.invoiceNumber, quoteId]);

  // Helpers
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addItem = () => {
    setItems([
      ...items,
      { id: generateId(), description: "", quantity: 1, unitPrice: "" },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof EditableItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const reorderItems = (newItems: EditableItem[]) => {
    setItems(newItems);
  };

  // Calculate totals
  const getSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice) || 0;
      return sum + item.quantity * price;
    }, 0);
  };

  const getTaxAmount = () => {
    const subtotal = getSubtotal();
    const taxValue = parseFloat(vatRate) || 0;
    return subtotal * (taxValue / 100);
  };

  const getTotal = () => {
    return getSubtotal() + getTaxAmount();
  };

  // Check if form is valid
  const isValid = items.some(
    (item) => item.description.trim() && parseFloat(item.unitPrice) > 0
  );

  // Get valid items
  const getValidItems = () =>
    items.filter(
      (item) => item.description.trim() && parseFloat(item.unitPrice) > 0
    );

  // Format helpers
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handle save changes
  const handleSave = async () => {
    if (!quote) return;

    const validItems = getValidItems();
    if (validItems.length === 0) return;

    try {
      await updateQuote.mutateAsync({
        quoteId: quote.id,
        input: {
          vatRate: parseFloat(vatRate) || 20,
          items: validItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      });
      router.push(`/quotes/${quoteId}`);
    } catch {
      // Error handled by mutation
    }
  };

  // Handle save and send
  const handleSaveAndSend = async () => {
    if (!quote) return;

    const validItems = getValidItems();
    if (validItems.length === 0) return;

    try {
      await updateQuote.mutateAsync({
        quoteId: quote.id,
        input: {
          vatRate: parseFloat(vatRate) || 20,
          items: validItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      });
      await sendQuote.mutateAsync(quote.id);
      router.push("/quotes");
    } catch {
      // Error handled by mutation
    }
  };

  const isSaving = updateQuote.isPending;
  const isSending = sendQuote.isPending;

  if (isLoading || !isInitialized) {
    return (
      <div className="h-full flex flex-col bg-[#F8F8F8] border-t border-[#EBEBEB] overflow-hidden">
        <div className="flex-shrink-0 flex items-center px-3 md:px-5 py-4">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="flex-shrink-0 h-px bg-[#EAEAEA]" />
        <div className="flex-1 flex min-h-0 p-4 gap-4">
          <div className="flex-[3] bg-gray-100 animate-pulse rounded-2xl" />
          <div className="flex-[2] bg-gray-100 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[#7F7F7F]">
        <p>Quote not found</p>
        <button
          onClick={() => router.push("/quotes")}
          className="mt-4 text-[#ff8c32] hover:underline"
        >
          Back to Quotes
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F8F8] border-t border-[#EBEBEB] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 md:px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/quotes/${quoteId}`)}
            className="flex items-center gap-2 text-[#494F57] hover:text-[#1F2937] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-semibold">Edit Quote</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/quotes/${quoteId}`)}
            className="rounded-full h-10 px-5 border-[#D1D5DB] text-[#494F57] shadow-none"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={!isValid || isSaving || isSending}
            className="rounded-full h-10 px-5 bg-[#F97316] text-white border-[#F97316] hover:bg-[#EA580C] shadow-none disabled:opacity-50"
          >
            {isSaving && !isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          {/* Save & Send only for draft / rejected / expired — never after deposit */}
          {(quote.status === "draft" ||
            quote.status === "rejected" ||
            quote.status === "expired") && (
            <CustomButton
              onClick={handleSaveAndSend}
              disabled={!isValid || isSaving || isSending}
              loading={isSending}
              loadingText="Sending..."
              normalColor={!isValid ? "#EFE2DD" : "#ff8c32"}
              textColor={!isValid ? "#B09388" : "white"}
              style={{ opacity: 1 }}
            >
              <QuoteIcon color={!isValid ? "#B09388" : "white"} />
              {quote.status === "draft" ? "Save & Send" : "Save & Resend"}
            </CustomButton>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 h-px bg-[#EAEAEA]" />

      {/* Content Area - Split Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left - Invoice Preview */}
        <div className="flex-[3] p-4 bg-[#F8F8F8] overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-lg font-bold">
                  <span className="text-[#ff8c32]">FAIL</span>
                  <span className="text-[#494F57]">2FIX</span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[#97999D]">Invoice Date</div>
                <div className="text-[#494F57] font-semibold">
                  {formatDate(quote.sentAt || quote.createdAt)}
                </div>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-[#494F57] mb-1">Invoice</h1>
              <div className="text-[#97999D] text-sm">#{quote.invoiceNumber || "Draft"}</div>
              <div className="text-right text-sm -mt-8">
                <div className="text-[#97999D]">Due Date</div>
                <div className="text-[#494F57] font-semibold">
                  {dueDate ? formatDate(dueDate) : "-"}
                </div>
              </div>
            </div>

            {/* From / To Section */}
            <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
              <div>
                <div className="text-[#97999D] mb-2">From</div>
                <div className="text-[#494F57] font-semibold">Fail2Fix Ltd</div>
                <div className="text-[#81868C]">support@fail2fix.com</div>
                <div className="text-[#81868C]">London, UK</div>
              </div>
              <div className="text-right">
                <div className="text-[#97999D] mb-2">To</div>
                <div className="text-[#494F57] font-semibold">{quote.customerName}</div>
                <div className="text-[#81868C]">{quote.customerEmail}</div>
              </div>
            </div>

            {/* Items Table */}
            <div className="flex-1 mb-6">
              <div className="border-t border-b border-[#EAEAEA] py-3">
                <div className="grid grid-cols-12 text-sm font-semibold text-[#494F57]">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
              </div>

              <div className="py-2 space-y-2 min-h-[100px]">
                {items.filter(item => item.description || parseFloat(item.unitPrice) > 0).map((item) => {
                  const itemTotal = item.quantity * (parseFloat(item.unitPrice) || 0);
                  return (
                    <div key={item.id} className="grid grid-cols-12 text-sm text-[#81868C] py-1">
                      <div className="col-span-5 truncate">{item.description || "—"}</div>
                      <div className="col-span-2 text-center">{item.quantity}</div>
                      <div className="col-span-2 text-center">{item.unitPrice ? `£${item.unitPrice}` : "—"}</div>
                      <div className="col-span-3 text-right">{itemTotal > 0 ? `£${formatCurrency(itemTotal)}` : "—"}</div>
                    </div>
                  );
                })}
                {items.filter(item => item.description || parseFloat(item.unitPrice) > 0).length === 0 && (
                  <div className="text-center text-[#C4C4C4] text-sm py-8">
                    Add items to see preview
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto flex justify-between items-end">
              <div className="text-xs text-[#97999D]">Fail2fix.com</div>
              <div className="w-72 rounded-xl border border-[#EAEAEA] overflow-hidden bg-white">
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#81868C]">Subtotal</span>
                    <span className="text-[#494F57] font-medium">£{formatCurrency(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#81868C]">Tax ({vatRate}%)</span>
                    <span className="text-[#494F57] font-medium">£{formatCurrency(getTaxAmount())}</span>
                  </div>
                </div>
                <div className="h-px bg-[#EAEAEA]" />
                <div className="p-4 flex justify-between items-center">
                  <span className="text-[#494F57] font-semibold">Total Due</span>
                  <span className="text-xl font-semibold text-[#494F57]">£{formatCurrency(getTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="flex-shrink-0 w-px bg-[#E5E5E5]" />

        {/* Right - Edit Form */}
        <div className="flex-[2] bg-[#F1F1F1] overflow-y-auto">
          <div className="p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#494F57]">Edit Quote</h2>
            </div>

            {/* Quote Title */}
            <div className="mb-4">
              <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-2">
                Quote Title
              </div>
              <Input
                placeholder="e.g. Kitchen Sink Repair, Boiler Installation..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 bg-white border-[#EAEAEA]"
              />
            </div>

            {/* Customer Info (Read-only) */}
            <div className="mb-4">
              <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-2">
                Customer Info
              </div>
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#EAEAEA]">
                <div className="flex items-center gap-2.5">
                  <UserAvatar id={quote.customerId} name={quote.customerName || "Unknown"} size="sm" />
                  <div>
                    <div className="font-medium text-sm text-[#494F57]">{quote.customerName}</div>
                    <div className="text-xs text-[#81868C]">{quote.customerEmail}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="mb-4">
              <label className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-1.5 block">
                Due Date
              </label>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal bg-white border-[#EAEAEA] text-sm shadow-none",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#97999D]" />
                    {dueDate ? format(new Date(dueDate), "dd/MM/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-none border border-[#EAEAEA]" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate ? new Date(dueDate) : undefined}
                    onSelect={(date) => {
                      setDueDate(date ? format(date, "yyyy-MM-dd") : "");
                      setDueDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#DADADA] -mx-5 mb-4" />

            {/* Items */}
            <div className="flex-1 mb-4">
              <div className="flex items-center gap-1 mb-2 text-xs font-medium text-[#97999D] uppercase tracking-wider">
                <div className="w-4" />
                <div className="flex-[4]">Item Name</div>
                <div className="flex-[1.5] text-center">Qty</div>
                <div className="flex-[2] text-center">Price</div>
                <div className="w-6" />
              </div>

              <Reorder.Group
                axis="y"
                values={items}
                onReorder={reorderItems}
                className="space-y-1.5"
              >
                {items.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    className="flex items-center gap-1"
                  >
                    <div className="w-4 flex-shrink-0 cursor-grab active:cursor-grabbing text-[#BEBEBE] hover:text-[#888]">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex-[4]">
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        className="h-11 bg-white border-[#EAEAEA] text-sm"
                      />
                    </div>
                    <div className="flex-[1.5]">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="h-10 bg-white border-[#EAEAEA] text-center text-sm"
                      />
                    </div>
                    <div className="flex-[2]">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                        className="h-11 bg-white border-[#EAEAEA] text-sm"
                      />
                    </div>
                    <div className="w-6 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="h-6 w-6 p-0 text-[#C4C4C4] hover:text-[#FF1603] hover:bg-[#FFF8F8] disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              <CustomButton
                onClick={addItem}
                normalColor="#E9E6E5"
                textColor="#493D39"
                fullWidth
                size="sm"
                className="mt-2"
                style={{ borderRadius: 8, border: "1px solid #E2DDDB" }}
              >
                <AddItemIcon />
                Add Item
              </CustomButton>
            </div>

            {/* VAT Rate */}
            <div>
              <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-2">
                VAT Rate (%)
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="h-10 bg-white border-[#EAEAEA]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

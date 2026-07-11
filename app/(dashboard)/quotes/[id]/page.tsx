"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, type Variants } from "motion/react";
import { ArrowLeft, Clock, AlertTriangle, XCircle, Download, Pencil, Trash2, Send, Loader2, Banknote, Building2, CheckCircle, Package } from "lucide-react";
import { domToPng } from "modern-screenshot";
import { jsPDF } from "jspdf";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useQuote, useSendQuote, useDeleteQuote } from "@/hooks/use-quotes";
import { useRecordDeposit } from "@/hooks/use-payments";
import { quoteStatusConfig } from "@/types/quote";
import CustomButton from "@/components/custombutton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Animation variants for card flip content
const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.35,
      staggerChildren: 0.1,
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, x: -20, y: -10 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

const labelVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 28 },
  },
};

const chipContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const chipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 500, damping: 20 },
  },
  tap: { scale: 0.92 },
  selected: {
    scale: [1, 1.15, 0.97, 1.03, 1],
    transition: { duration: 0.35, times: [0, 0.3, 0.5, 0.7, 1] },
  },
};

const inputVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};

const buttonContainerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 28 },
  },
};

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;
  const setHeader = useDashboardStore((state) => state.setHeader);

  const { data: quote, isLoading, refetch } = useQuote(quoteId);
  const sendQuote = useSendQuote();
  const deleteQuote = useDeleteQuote();
  const recordDeposit = useRecordDeposit();

  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | null>(null);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    setHeader({
      title: "",
      description: "",
      showBreadcrumbs: false,
      showButton: false,
    });
  }, [setHeader]);

  // Calculate validity/expiry info
  const validityInfo = useMemo(() => {
    if (!quote?.validUntil) return null;

    const now = new Date();
    const validUntil = new Date(quote.validUntil);
    const diffTime = validUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Expired", urgent: true, icon: XCircle };
    } else if (diffDays === 0) {
      return { text: "Expires today", urgent: true, icon: AlertTriangle };
    } else if (diffDays === 1) {
      return { text: "Expires tomorrow", urgent: true, icon: AlertTriangle };
    } else if (diffDays <= 3) {
      return { text: `Expires in ${diffDays} days`, urgent: true, icon: Clock };
    } else if (diffDays <= 7) {
      return { text: `Expires in ${diffDays} days`, urgent: false, icon: Clock };
    } else {
      return {
        text: `Valid until ${validUntil.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
        urgent: false,
        icon: Clock
      };
    }
  }, [quote?.validUntil]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "0.00";
    return parseFloat(amount).toFixed(2);
  };

  const handleDownload = async () => {
    const element = document.getElementById("invoice-print-area");
    if (!element) return;

    setIsDownloading(true);

    const originalStyles = {
      borderRadius: element.style.borderRadius,
      border: element.style.border,
      minHeight: element.style.minHeight,
      height: element.style.height,
      boxShadow: element.style.boxShadow,
    };

    try {
      const a4AspectRatio = 297 / 210;
      const elementWidth = element.offsetWidth;
      const a4Height = elementWidth * a4AspectRatio;

      element.style.height = "auto";
      element.style.minHeight = "auto";
      const contentHeight = element.scrollHeight;

      const pagesNeeded = Math.ceil(contentHeight / a4Height);
      const totalHeight = pagesNeeded * a4Height;

      element.style.borderRadius = "0";
      element.style.border = "none";
      element.style.boxShadow = "none";
      element.style.height = `${totalHeight}px`;
      element.style.minHeight = `${totalHeight}px`;

      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const margin = 5;
      const pdfWidth = 210 - margin * 2;
      const pageHeight = 297 - margin * 2;

      const imgWidth = pdfWidth;
      const imgHeight = (img.height * pdfWidth) / img.width;
      const singlePageHeight = imgHeight / pagesNeeded;

      for (let page = 0; page < pagesNeeded; page++) {
        if (page > 0) pdf.addPage();

        const sourceY = (page * singlePageHeight * img.width) / pdfWidth;
        const sourceHeight = (singlePageHeight * img.width) / pdfWidth;

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = sourceHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, sourceY, img.width, sourceHeight, 0, 0, img.width, sourceHeight);
          const pageData = canvas.toDataURL("image/png");
          pdf.addImage(pageData, "PNG", margin, margin, imgWidth, Math.min(singlePageHeight, pageHeight));
        }
      }

      const fileName = `${quote?.invoiceNumber || "quote"}-${quote?.customerName?.replace(/\s+/g, "-") || "customer"}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      element.style.borderRadius = originalStyles.borderRadius;
      element.style.border = originalStyles.border;
      element.style.minHeight = originalStyles.minHeight;
      element.style.height = originalStyles.height;
      element.style.boxShadow = originalStyles.boxShadow;
      setIsDownloading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/quotes/${quoteId}/edit`);
  };

  const handleSend = async () => {
    if (!quote) return;
    try {
      await sendQuote.mutateAsync(quote.id);
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!quote) return;
    try {
      await deleteQuote.mutateAsync(quote.id);
      router.push("/quotes");
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancelPayment = () => {
    setIsRecordingPayment(false);
    setPaymentMethod(null);
    setTransactionId("");
  };

  const handleRecordDeposit = async () => {
    if (!quote || !paymentMethod) return;
    try {
      const result = await recordDeposit.mutateAsync({
        quoteId: quote.id,
        method: paymentMethod,
        transactionId: transactionId || undefined,
      });
      handleCancelPayment();
      refetch();
      const orderId = (result?.order as { id?: string })?.id;
      if (orderId) {
        router.push(`/orders/${orderId}`);
      }
    } catch {
      // Error handled by mutation
    }
  };

  // Calculate deposit and balance amounts
  const total = parseFloat(quote?.total || "0");
  const depositAmount = total * 0.10;
  const balanceAmount = total * 0.90;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-[#F8F8F8] border-t border-[#EBEBEB] overflow-hidden">
        <div className="flex-shrink-0 flex items-center px-3 md:px-5 py-4">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="flex-shrink-0 h-px bg-[#EAEAEA]" />
        <div className="flex-1 flex min-h-0 p-4 gap-4">
          <div className="flex-[3] bg-gray-100 animate-pulse rounded-2xl" />
          <div className="flex-[1] bg-gray-100 animate-pulse rounded-2xl" />
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

  const statusConfig = quoteStatusConfig[quote.status];
  // Non-paid quotes can be edited and deleted
  const canEdit = quote.status !== "paid" && quote.status !== "deposit_paid";
  const canSend = quote.status === "draft";
  const canResend = quote.status === "rejected" || quote.status === "expired";
  const canDelete = quote.status !== "paid" && quote.status !== "deposit_paid";
  const canRecordDeposit = quote.status === "sent";
  const isDepositPaid = quote.status === "deposit_paid";
  const isPaid = quote.status === "paid";

  return (
    <div className="h-full flex flex-col bg-[#F8F8F8] overflow-hidden">
      {/* Back button + Edit/Delete */}
      <div className="flex-shrink-0 px-3 md:px-5 py-2 bg-white flex items-center justify-between">
        <button
          onClick={() => router.push("/quotes")}
          className="flex items-center gap-2 text-[#7F7F7F] hover:text-[#1F2937] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Quotes</span>
        </button>

        {/* Edit/Delete buttons */}
        {canEdit && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="h-8 px-3 border-[#D1D5DB] text-[#494F57] shadow-none"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 border-[#D1D5DB] text-[#97999D] hover:text-red-600 hover:border-red-200 hover:bg-red-50 shadow-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 h-px bg-[#EAEAEA]" />

      {/* Header content */}
      <div className="flex-shrink-0 px-3 md:px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left - Quote info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base md:text-lg font-semibold text-[#1F2937]">
                {quote.invoiceNumber || "Draft Quote"}
              </h1>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  color: statusConfig.textColor,
                  backgroundColor: statusConfig.bgColor,
                  border: `1px solid ${statusConfig.borderColor}`,
                }}
              >
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {quote.title && (
                <p className="text-sm text-[#7F7F7F] font-medium truncate">{quote.title}</p>
              )}
              {quote.title && validityInfo && (
                <span className="text-[#7F7F7F]">·</span>
              )}
              {validityInfo && (
                <div className={`flex items-center gap-1 text-sm font-medium flex-shrink-0 ${
                  validityInfo.urgent ? "text-[#DC2626]" : "text-[#7F7F7F]"
                }`}>
                  <validityInfo.icon className="w-3.5 h-3.5" />
                  <span>{validityInfo.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right - Total amount */}
          <div className="text-right flex-shrink-0">
            <p className="text-lg md:text-xl font-bold text-[#1F2937]">
              £{parseFloat(quote.total).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-[#7F7F7F] font-medium">
              inc. VAT £{parseFloat(quote.vatAmount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 h-px bg-[#EAEAEA]" />

      {/* Content Area - Split Layout */}
      <div className="flex-1 flex min-h-0 pt-4 px-4 gap-4">
        {/* Left - Invoice Preview (scrollable) */}
        <div className="flex-[3] overflow-y-auto pb-4">
          <div id="invoice-print-area" className="bg-white rounded-2xl border border-[#E0E0E0] p-6 flex flex-col min-h-[600px]">
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
              {quote.validUntil && (
                <div className="text-right text-sm -mt-8">
                  <div className="text-[#97999D]">Valid Until</div>
                  <div className="text-[#494F57] font-semibold">
                    {formatDate(quote.validUntil)}
                  </div>
                </div>
              )}
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
                <div className="text-[#494F57] font-semibold">{quote.customerName || "Customer"}</div>
                {quote.customerEmail && (
                  <div className="text-[#81868C]">{quote.customerEmail}</div>
                )}
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
                {quote.items && quote.items.length > 0 ? (
                  quote.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 text-sm text-[#81868C] py-1"
                    >
                      <div className="col-span-5 truncate">{item.description}</div>
                      <div className="col-span-2 text-center">{item.quantity}</div>
                      <div className="col-span-2 text-center">
                        £{formatCurrency(item.unitPrice)}
                      </div>
                      <div className="col-span-3 text-right">
                        £{formatCurrency(item.total)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[#C4C4C4] text-sm py-8">
                    No items
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="mb-6 p-4 bg-[#F9FAFB] rounded-lg border border-[#EAEAEA]">
                <div className="text-xs font-semibold text-[#97999D] uppercase mb-2">
                  Notes
                </div>
                <p className="text-sm text-[#494F57]">{quote.notes}</p>
              </div>
            )}

            {/* Bottom Section - Footer & Totals */}
            <div className="mt-auto flex justify-between items-end">
              {/* Footer */}
              <div className="text-xs text-[#97999D]">Fail2fix.com</div>

              {/* Totals */}
              <div className="w-72 rounded-xl border border-[#EAEAEA] overflow-hidden bg-white">
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#81868C]">Subtotal</span>
                    <span className="text-[#494F57] font-medium">
                      £{formatCurrency(quote.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#81868C]">
                      VAT {quote.vatRate ? `(${quote.vatRate}%)` : ""}
                    </span>
                    <span className="text-[#494F57] font-medium">
                      £{formatCurrency(quote.vatAmount)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-[#EAEAEA]" />

                <div className="p-4 flex justify-between items-center">
                  <span className="text-[#494F57] font-semibold">Total Due</span>
                  <span className="text-xl font-semibold text-[#494F57]">
                    £{formatCurrency(quote.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Actions Panel with Card Flip */}
        <div className="flex-[1] min-w-[280px] max-w-[320px] overflow-y-auto pb-4" style={{ perspective: "1000px" }}>
          <motion.div
            className="h-full relative"
            animate={{ rotateY: isRecordingPayment ? 180 : 0 }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 12,
              mass: 0.9,
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* ===== FRONT FACE - Default View ===== */}
            <div
              className="bg-white rounded-2xl border border-[#E0E0E0] p-5 h-full flex flex-col absolute inset-0"
              style={{ backfaceVisibility: "hidden" }}
            >
              {/* Summary Info */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7F7F7F] font-medium">Total</span>
                  <span className="text-[#1F2937] font-semibold">
                    £{parseFloat(quote.total || "0").toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7F7F7F] font-medium">Items</span>
                  <span className="text-[#1F2937] font-medium">{quote.items?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7F7F7F] font-medium">Customer</span>
                  <span className="text-[#1F2937] font-medium truncate max-w-[150px]">
                    {quote.customerName || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7F7F7F] font-medium">Created</span>
                  <span className="text-[#1F2937] font-medium">
                    {quote.createdAt
                      ? new Date(quote.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
                {quote.sentAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7F7F7F] font-medium">Sent</span>
                    <span className="text-[#1F2937] font-medium">
                      {new Date(quote.sentAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Rejection Info */}
              {quote.status === "rejected" && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-xs font-semibold text-red-700 uppercase mb-1">
                    Rejection Reason
                  </div>
                  <p className="text-sm text-red-700">{quote.rejectionReason || "No reason provided"}</p>
                  {quote.rejectionNote && (
                    <p className="text-xs text-red-600 mt-1">{quote.rejectionNote}</p>
                  )}
                  {quote.rejectedAt && (
                    <p className="text-xs text-red-500 mt-2">
                      Rejected on {new Date(quote.rejectedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Deposit Paid State */}
              {isDepositPaid && (
                <div className="mb-4 rounded-xl bg-white border border-[#E0E0E0] p-4">
                  <h4 className="text-sm font-semibold text-[#1F2937] mb-3">Payment Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B7280] flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Deposit (10%)
                      </span>
                      <span className="font-medium text-green-600">£{depositAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B7280] flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-[#D1D5DB]" />
                        Balance (90%)
                      </span>
                      <span className="font-medium text-[#6B7280]">£{balanceAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-3">Balance due after work completes</p>
                </div>
              )}

              {/* Fully Paid State */}
              {isPaid && (
                <div className="mb-4 rounded-xl bg-white border border-[#E0E0E0] p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1F2937]">Fully Paid</h4>
                      {quote.acceptedAt && (
                        <p className="text-xs text-[#6B7280]">
                          {new Date(quote.acceptedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {/* Download PDF */}
                <CustomButton
                  fullWidth
                  onClick={handleDownload}
                  disabled={isDownloading}
                  normalColor="white"
                  textColor="#494F57"
                  style={{ border: "1px solid #D1D5DB" }}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </>
                  )}
                </CustomButton>

                {/* Send Button - for draft */}
                {canSend && (
                  <CustomButton
                    fullWidth
                    onClick={handleSend}
                    disabled={sendQuote.isPending}
                    loading={sendQuote.isPending}
                    loadingText="Sending..."
                    normalColor="#ff8c32"
                    textColor="white"
                  >
                    <Send className="w-4 h-4" />
                    Send Quote
                  </CustomButton>
                )}

                {/* Resend Button - for rejected (after edit) */}
                {canResend && (
                  <CustomButton
                    fullWidth
                    onClick={handleSend}
                    disabled={sendQuote.isPending}
                    loading={sendQuote.isPending}
                    loadingText="Sending..."
                    normalColor="#ff8c32"
                    textColor="white"
                  >
                    <Send className="w-4 h-4" />
                    Resend Quote
                  </CustomButton>
                )}

                {/* Record Deposit Button */}
                {canRecordDeposit && (
                  <CustomButton
                    fullWidth
                    onClick={() => setIsRecordingPayment(true)}
                    normalColor="#ff8c32"
                    textColor="white"
                  >
                    <Banknote className="w-4 h-4" />
                    Record Deposit (10%)
                  </CustomButton>
                )}

                {/* View Order Button - for deposit_paid or paid quotes */}
                {(isDepositPaid || isPaid) && (quote as { orderId?: string }).orderId && (
                  <CustomButton
                    fullWidth
                    onClick={() => router.push(`/orders/${(quote as { orderId?: string }).orderId}`)}
                    normalColor="#059669"
                    textColor="white"
                  >
                    <Package className="w-4 h-4" />
                    View Order
                  </CustomButton>
                )}
              </div>
            </div>

            {/* ===== BACK FACE - Payment Method Selection ===== */}
            <div
              className="bg-white rounded-2xl border border-[#E0E0E0] p-5 h-full flex flex-col absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <motion.div
                className="flex flex-col h-full"
                variants={contentVariants}
                initial="hidden"
                animate={isRecordingPayment ? "visible" : "hidden"}
              >
                {/* Header */}
                <motion.div variants={headerVariants} className="flex items-center gap-2 mb-4">
                  <motion.button
                    onClick={handleCancelPayment}
                    className="p-1 rounded-md text-[#7F7F7F] hover:text-[#1F2937] hover:bg-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.button>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1F2937]">Record Deposit (10%)</h3>
                    <p className="text-xs text-[#7F7F7F]">Select payment method</p>
                  </div>
                </motion.div>

                {/* Payment Method Selection */}
                <motion.div variants={labelVariants} className="mb-4">
                  <label className="text-xs font-medium text-[#7F7F7F] uppercase tracking-wider mb-3 block">
                    Payment Method <span className="text-[#ff8c32]">*</span>
                  </label>
                  <motion.div className="space-y-2.5" variants={chipContainerVariants}>
                    <motion.button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      variants={chipVariants}
                      whileHover={{ scale: 1.01 }}
                      whileTap="tap"
                      animate={paymentMethod === "cash" ? "selected" : undefined}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                        paymentMethod === "cash"
                          ? "border-[#ff8c32] bg-[#FFF8F5]"
                          : "border-[#EAEAEA] hover:border-[#ff8c32]/40"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        paymentMethod === "cash" ? "bg-[#FFF1EB]" : "bg-[#F5F5F5]"
                      }`}>
                        <Banknote className={`w-4 h-4 ${
                          paymentMethod === "cash" ? "text-[#ff8c32]" : "text-[#7F7F7F]"
                        }`} />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          paymentMethod === "cash" ? "text-[#C54A17]" : "text-[#494F57]"
                        }`}>Cash</div>
                        <div className="text-xs text-[#97999D]">In-person payment</div>
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => setPaymentMethod("bank_transfer")}
                      variants={chipVariants}
                      whileHover={{ scale: 1.01 }}
                      whileTap="tap"
                      animate={paymentMethod === "bank_transfer" ? "selected" : undefined}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                        paymentMethod === "bank_transfer"
                          ? "border-[#ff8c32] bg-[#FFF8F5]"
                          : "border-[#EAEAEA] hover:border-[#ff8c32]/40"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        paymentMethod === "bank_transfer" ? "bg-[#FFF1EB]" : "bg-[#F5F5F5]"
                      }`}>
                        <Building2 className={`w-4 h-4 ${
                          paymentMethod === "bank_transfer" ? "text-[#ff8c32]" : "text-[#7F7F7F]"
                        }`} />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          paymentMethod === "bank_transfer" ? "text-[#C54A17]" : "text-[#494F57]"
                        }`}>Bank Transfer</div>
                        <div className="text-xs text-[#97999D]">BACS / Wire transfer</div>
                      </div>
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Transaction Reference (for bank transfer) */}
                {paymentMethod === "bank_transfer" && (
                  <motion.div variants={inputVariants} className="mb-4">
                    <label className="text-xs font-medium text-[#7F7F7F] uppercase tracking-wider mb-2 block">
                      Transaction Reference <span className="text-[#9CA3AF]">(optional)</span>
                    </label>
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter reference..."
                      className="h-11 border-[#EAEAEA]"
                    />
                  </motion.div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Amount Summary */}
                <motion.div variants={inputVariants} className="mb-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#EAEAEA]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7F7F7F] font-medium">Deposit amount</span>
                    <span className="text-lg font-semibold text-[#1F2937]">
                      £{depositAmount.toFixed(2)}
                    </span>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div className="flex gap-3" variants={buttonContainerVariants}>
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CustomButton
                      fullWidth
                      onClick={handleCancelPayment}
                      normalColor="white"
                      textColor="#494F57"
                      style={{ border: "1px solid #D1D5DB" }}
                    >
                      Cancel
                    </CustomButton>
                  </motion.div>
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CustomButton
                      fullWidth
                      onClick={handleRecordDeposit}
                      disabled={!paymentMethod || recordDeposit.isPending}
                      loading={recordDeposit.isPending}
                      loadingText="Recording..."
                      normalColor="#ff8c32"
                      textColor="white"
                    >
                      Confirm
                    </CustomButton>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quote? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteQuote.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

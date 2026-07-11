"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Copy, Check, Phone, Calendar, FileText, ExternalLink, Plus, MessageSquare, X, Send, Info, AlertTriangle, AlertOctagon, Banknote, Building2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useOrder, useUpdateOrderStatus, useCreateOrderUpdate } from "@/hooks/use-orders";
import { useRecordBalance } from "@/hooks/use-payments";
import { orderStatusConfig, type UpdateOrderStatusInput, type OrderUpdateType, type QuoteStatus } from "@/types/order";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/custombutton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const setHeader = useDashboardStore((state) => state.setHeader);

  const { data: order, isLoading, refetch } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const createUpdate = useCreateOrderUpdate();
  const recordBalance = useRecordBalance();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<OrderUpdateType>("info");

  // Balance payment state
  const [isRecordingBalance, setIsRecordingBalance] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | null>(null);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    setHeader({
      title: "Orders",
      description: "",
      showBreadcrumbs: true,
      breadcrumbs: [
        { label: "Orders", href: "/orders" },
        { label: order?.orderNumber || "Loading..." },
      ],
      showButton: false,
    });
  }, [setHeader, order?.orderNumber]);

  // Calculate payment status
  const paymentInfo = useMemo(() => {
    if (!order?.quote) return null;

    const total = parseFloat(order.quote.total);
    const depositAmount = order.quote.depositAmount
      ? parseFloat(order.quote.depositAmount)
      : total * 0.10;
    const balanceAmount = order.quote.balanceAmount
      ? parseFloat(order.quote.balanceAmount)
      : total * 0.90;

    const depositPayment = order.payments?.find(p => p.type === "deposit" && p.status === "completed");
    const balancePayment = order.payments?.find(p => p.type === "balance" && p.status === "completed");
    const fullPayment = order.payments?.find(p => p.type === "full" && p.status === "completed");

    const isDepositPaid = !!depositPayment || order.quote.status === "deposit_paid" || order.quote.status === "paid";
    const isBalancePaid = !!balancePayment || !!fullPayment || order.quote.status === "paid";
    const isFullyPaid = order.quote.status === "paid";

    // Can record balance when order is completed and deposit is paid but balance not paid
    const canRecordBalance = order.status === "completed" && isDepositPaid && !isBalancePaid;

    return {
      total,
      depositAmount,
      balanceAmount,
      isDepositPaid,
      isBalancePaid,
      isFullyPaid,
      canRecordBalance,
      depositPayment,
      balancePayment,
      quoteStatus: order.quote.status as QuoteStatus,
    };
  }, [order]);

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success("Copied to clipboard", { sound: false });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!order) return;
    updateStatus.mutate({
      orderId: order.id,
      input: { status: newStatus as UpdateOrderStatusInput["status"] },
    });
  };

  const handleAddNote = () => {
    if (!order || !noteText.trim()) return;

    createUpdate.mutate(
      {
        orderId: order.id,
        input: {
          type: noteType,
          content: noteText.trim(),
        },
      },
      {
        onSuccess: () => {
          setNoteText("");
          setNoteType("info");
          setShowNoteInput(false);
        },
      }
    );
  };

  const handleRecordBalance = async () => {
    if (!order?.quoteId || !paymentMethod) return;

    try {
      await recordBalance.mutateAsync({
        quoteId: order.quoteId,
        method: paymentMethod,
        transactionId: transactionId || undefined,
      });
      setIsRecordingBalance(false);
      setPaymentMethod(null);
      setTransactionId("");
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancelRecordBalance = () => {
    setIsRecordingBalance(false);
    setPaymentMethod(null);
    setTransactionId("");
  };

  const CopyButton = ({ value, field }: { value: string; field: string }) => (
    <button
      onClick={() => handleCopy(value, field)}
      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-[#9CA3AF]" />
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="h-full bg-[#F8F8F8] border-t border-[#EBEBEB] overflow-auto">
        <div className="max-w-4xl mx-auto px-3 md:px-5 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-full bg-[#F8F8F8] border-t border-[#EBEBEB] flex flex-col items-center justify-center min-h-[400px] text-[#7F7F7F]">
        <p>Order not found</p>
        <button
          onClick={() => router.push("/orders")}
          className="mt-4 text-[#ff8c32] hover:underline"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const config = orderStatusConfig[order.status];
  const quoteTotal = order.quote ? parseFloat(order.quote.total) : 0;
  const itemCount = order.quote?.items?.length || 0;

  return (
    <div className="h-full bg-[#F8F8F8] border-t border-[#EBEBEB] overflow-auto">
      <div className="max-w-4xl mx-auto px-3 md:px-5 py-6">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 text-[#494F57] hover:text-[#1F2937] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-semibold">{order.orderNumber}</span>
          </button>

          {/* Status Selector */}
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger
              className="w-auto min-w-[140px] h-9 border rounded-lg text-sm font-medium"
              style={{
                backgroundColor: config.bgColor,
                color: config.textColor,
                borderColor: config.borderColor,
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["pending", "in_progress", "on_hold", "completed", "cancelled", "closed"] as const).map((status) => {
                const cfg = orderStatusConfig[status];
                return (
                  <SelectItem key={status} value={status}>
                    <span style={{ color: cfg.textColor }}>{cfg.label}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          {/* Payment Status Card */}
          {paymentInfo && (paymentInfo.isDepositPaid || paymentInfo.canRecordBalance || paymentInfo.isFullyPaid) && (
            <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
              {/* Payment Status Header */}
              <div className="p-6">
                <h2 className="text-base font-semibold text-[#1F2937] mb-4">Payment Status</h2>

                {/* Payment Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7280] flex items-center gap-2">
                      {paymentInfo.isDepositPaid && <Check className="w-4 h-4 text-green-500" />}
                      {!paymentInfo.isDepositPaid && <span className="w-4 h-4 rounded-full border-2 border-[#D1D5DB]" />}
                      Deposit (10%)
                    </span>
                    <span className={`text-sm font-medium ${paymentInfo.isDepositPaid ? "text-green-600" : "text-[#6B7280]"}`}>
                      £{paymentInfo.depositAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7280] flex items-center gap-2">
                      {paymentInfo.isBalancePaid && <Check className="w-4 h-4 text-green-500" />}
                      {!paymentInfo.isBalancePaid && <span className="w-4 h-4 rounded-full border-2 border-[#D1D5DB]" />}
                      Balance (90%)
                    </span>
                    <span className={`text-sm font-medium ${paymentInfo.isBalancePaid ? "text-green-600" : "text-[#6B7280]"}`}>
                      £{paymentInfo.balanceAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1F2937]">Total</span>
                    <span className="text-base font-semibold text-[#1F2937]">
                      £{paymentInfo.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Awaiting work completion notice */}
                {paymentInfo.isDepositPaid && !paymentInfo.canRecordBalance && !paymentInfo.isFullyPaid && (
                  <p className="mt-4 text-sm text-[#6B7280]">
                    Mark order as &quot;Completed&quot; to record balance payment
                  </p>
                )}

                {/* Record Balance Button */}
                {paymentInfo.canRecordBalance && !isRecordingBalance && (
                  <div className="mt-4">
                    <CustomButton
                      onClick={() => setIsRecordingBalance(true)}
                      normalColor="#ff8c32"
                      textColor="white"
                    >
                      <Banknote className="w-4 h-4" />
                      Record Balance (90%)
                    </CustomButton>
                  </div>
                )}
              </div>

              {/* Record Balance Form */}
              <AnimatePresence>
                {isRecordingBalance && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 border-t border-[#E0E0E0] bg-[#F9FAFB]">
                      {/* Payment Method Selection */}
                      <div className="mb-4">
                        <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-3 block">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("cash")}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                              paymentMethod === "cash"
                                ? "border-[#ff8c32] bg-white"
                                : "border-[#E0E0E0] bg-white hover:border-[#9CA3AF]"
                            }`}
                          >
                            <Banknote className={`w-5 h-5 ${
                              paymentMethod === "cash" ? "text-[#ff8c32]" : "text-[#6B7280]"
                            }`} />
                            <div>
                              <div className={`text-sm font-medium ${
                                paymentMethod === "cash" ? "text-[#1F2937]" : "text-[#494F57]"
                              }`}>Cash</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("bank_transfer")}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                              paymentMethod === "bank_transfer"
                                ? "border-[#ff8c32] bg-white"
                                : "border-[#E0E0E0] bg-white hover:border-[#9CA3AF]"
                            }`}
                          >
                            <Building2 className={`w-5 h-5 ${
                              paymentMethod === "bank_transfer" ? "text-[#ff8c32]" : "text-[#6B7280]"
                            }`} />
                            <div>
                              <div className={`text-sm font-medium ${
                                paymentMethod === "bank_transfer" ? "text-[#1F2937]" : "text-[#494F57]"
                              }`}>Bank Transfer</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Transaction Reference (for bank transfer) */}
                      {paymentMethod === "bank_transfer" && (
                        <div className="mb-4">
                          <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2 block">
                            Transaction Reference (optional)
                          </label>
                          <Input
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Enter reference..."
                            className="h-10 border-[#E0E0E0]"
                          />
                        </div>
                      )}

                      {/* Amount */}
                      <div className="mb-4 p-3 bg-white rounded-lg border border-[#E0E0E0]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#6B7280]">Amount</span>
                          <span className="text-lg font-semibold text-[#1F2937]">
                            £{paymentInfo?.balanceAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <CustomButton
                          fullWidth
                          onClick={handleCancelRecordBalance}
                          normalColor="white"
                          textColor="#494F57"
                          style={{ border: "1px solid #D1D5DB" }}
                        >
                          Cancel
                        </CustomButton>
                        <CustomButton
                          fullWidth
                          onClick={handleRecordBalance}
                          disabled={!paymentMethod || recordBalance.isPending}
                          loading={recordBalance.isPending}
                          loadingText="Recording..."
                          normalColor="#ff8c32"
                          textColor="white"
                        >
                          Confirm
                        </CustomButton>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Customer Details Card */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h2 className="text-base font-semibold text-[#1F2937] mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Name</p>
                <p className="text-sm font-medium text-[#1F2937]">
                  {order.customerName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Phone Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#9CA3AF]" />
                  <p className="text-sm font-medium text-[#1F2937]">
                    {order.customerPhone || "—"}
                  </p>
                  {order.customerPhone && (
                    <CopyButton value={order.customerPhone} field="phone" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h2 className="text-base font-semibold text-[#1F2937] mb-4">Order Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Order Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                  <p className="text-sm font-medium text-[#1F2937]">
                    {format(new Date(order.createdAt), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Quote Accepted</p>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#9CA3AF]" />
                  <p className="text-sm font-medium text-[#1F2937]">
                    {order.quote?.acceptedAt
                      ? format(new Date(order.quote.acceptedAt), "dd MMM yyyy")
                      : "—"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Total Items</p>
                <p className="text-sm font-medium text-[#1F2937]">{itemCount}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Linked Quote</p>
                {order.quoteId ? (
                  <Link
                    href={`/quotes/${order.quoteId}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ff8c32] hover:text-[#e06f12] transition-colors"
                  >
                    View Quote
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <p className="text-sm text-[#9CA3AF]">No linked quote</p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
            <div className="p-6 border-b border-[#E0E0E0]">
              <h2 className="text-base font-semibold text-[#1F2937]">
                {order.quote?.title || "Quote Items"}
              </h2>
              {order.quote?.invoiceNumber && (
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Invoice: {order.quote.invoiceNumber}
                </p>
              )}
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E0E0E0]">
                    <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">
                      Description
                    </th>
                    <th className="text-center text-xs font-medium text-[#6B7280] px-4 py-3 w-24">
                      Qty
                    </th>
                    <th className="text-right text-xs font-medium text-[#6B7280] px-4 py-3 w-32">
                      Unit Price
                    </th>
                    <th className="text-right text-xs font-medium text-[#6B7280] px-6 py-3 w-32">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.quote?.items && order.quote.items.length > 0 ? (
                    order.quote.items.map((item) => (
                      <tr key={item.id} className="border-b border-[#E0E0E0] last:border-0">
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#1F2937]">{item.description}</p>
                        </td>
                        <td className="text-center px-4 py-4">
                          <p className="text-sm text-[#6B7280]">{item.quantity}</p>
                        </td>
                        <td className="text-right px-4 py-4">
                          <p className="text-sm text-[#6B7280]">
                            £{parseFloat(item.unitPrice).toFixed(2)}
                          </p>
                        </td>
                        <td className="text-right px-6 py-4">
                          <p className="text-sm font-medium text-[#1F2937]">
                            £{parseFloat(item.total).toFixed(2)}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#9CA3AF]">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            {order.quote && (
              <div className="p-6 bg-[#F9FAFB] border-t border-[#E0E0E0]">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="text-[#1F2937] w-28 text-right">
                      £{parseFloat(order.quote.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-[#6B7280]">VAT ({order.quote.vatRate}%)</span>
                    <span className="text-[#1F2937] w-28 text-right">
                      £{parseFloat(order.quote.vatAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 text-base font-semibold pt-2 border-t border-[#E5E7EB] mt-2">
                    <span className="text-[#1F2937]">Total</span>
                    <span className="text-[#1F2937] w-28 text-right">
                      £{quoteTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Updates / Notes */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E0E0E0]">
              <h2 className="text-base font-semibold text-[#1F2937]">Updates</h2>
              {!showNoteInput && (
                <button
                  onClick={() => setShowNoteInput(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#ff8c32] hover:bg-[#e06f12] rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Update
                </button>
              )}
            </div>

            {/* Add Note Input */}
            <AnimatePresence>
              {showNoteInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-[#F9FAFB]">
                    {/* Type Selector */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-[#6B7280]">Type:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setNoteType("info")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            noteType === "info"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#9CA3AF]"
                          }`}
                        >
                          <Info className="w-3.5 h-3.5" />
                          Info
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteType("warning")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            noteType === "warning"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#9CA3AF]"
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Warning
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteType("critical")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            noteType === "critical"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#9CA3AF]"
                          }`}
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          Critical
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write an update..."
                      autoFocus
                      className="w-full h-24 p-4 text-sm bg-white border border-[#E0E0E0] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff8c32]/20 focus:border-[#ff8c32] transition-all placeholder:text-[#9CA3AF]"
                    />

                    <div className="flex items-center justify-end gap-2 mt-4">
                      <button
                        onClick={() => {
                          setShowNoteInput(false);
                          setNoteText("");
                          setNoteType("info");
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNote}
                        disabled={!noteText.trim() || createUpdate.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#ff8c32] hover:bg-[#e06f12] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {createUpdate.isPending ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Post Update
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Existing Updates */}
            {order.updates && order.updates.length > 0 ? (
              <div className="px-6 py-4 space-y-3">
                {order.updates.map((update) => (
                  <div
                    key={update.id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                      {update.type === "critical" ? (
                        <AlertOctagon className="w-4 h-4 text-red-500" />
                      ) : update.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Info className="w-4 h-4 text-[#9CA3AF]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#494F57] leading-relaxed">{update.content}</p>
                      <p className="text-xs text-[#9CA3AF] mt-1.5">
                        {format(new Date(update.createdAt), "dd MMM yyyy, HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !showNoteInput && (
                <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5 text-[#9CA3AF]" />
                  </div>
                  <p className="text-sm text-[#9CA3AF]">No updates yet</p>
                  <p className="text-xs text-[#D1D5DB] mt-1">Click &quot;Add Update&quot; to post the first one</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

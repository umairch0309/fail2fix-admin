/**
 * Payment Types (Admin)
 * Matches backend schema
 */

/**
 * Payment Method - matches backend enum
 */
export type PaymentMethod = "card" | "bank_transfer" | "cash";

/**
 * Payment Status - matches backend enum
 */
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

/**
 * Payment Type - deposit (10%), balance (90%), or full (legacy)
 */
export type PaymentType = "deposit" | "balance" | "full";

/**
 * Payment from API (admin view with customer info)
 */
export interface Payment {
  id: string;
  quoteId: string;
  orderId: string | null;
  customerId: string;
  amount: string;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  type: PaymentType;
  transactionId: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  customerName: string | null;
  customerEmail: string | null;
}

/**
 * Record manual payment input
 */
export interface RecordPaymentInput {
  quoteId: string;
  method: "cash" | "bank_transfer";
  transactionId?: string;
  notes?: string;
}

/**
 * Status display configuration
 */
export const paymentStatusConfig: Record<
  PaymentStatus,
  {
    label: string;
    textColor: string;
    statusColor: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  completed: {
    label: "Completed",
    textColor: "#395214",
    statusColor: "#B3EC3D",
    borderColor: "#B3EC3D",
    bgColor: "#FBFFF4",
  },
  pending: {
    label: "Pending",
    textColor: "#813500",
    statusColor: "#F59E0B",
    borderColor: "#FFE4D2",
    bgColor: "#FFF8F3",
  },
  failed: {
    label: "Failed",
    textColor: "#FF1603",
    statusColor: "#FF1603",
    borderColor: "#FFE1E1",
    bgColor: "#FFF8F8",
  },
  refunded: {
    label: "Refunded",
    textColor: "#1E40AF",
    statusColor: "#3B82F6",
    borderColor: "#BFDBFE",
    bgColor: "#EFF6FF",
  },
};

/**
 * Payment method display labels
 */
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: "Card",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
};

/**
 * Payment type display labels
 */
export const paymentTypeLabels: Record<PaymentType, string> = {
  deposit: "Deposit (10%)",
  balance: "Balance (90%)",
  full: "Full Payment",
};

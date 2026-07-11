/**
 * Quote Types (Admin)
 * Matches backend schema
 */

/**
 * Quote Status - matches backend enum
 */
export type QuoteStatus =
  | "draft"        // Being created by admin
  | "sent"         // Sent to customer, awaiting deposit payment
  | "deposit_paid" // 10% deposit paid, work in progress
  | "paid"         // Fully paid (deposit + balance)
  | "rejected"     // Customer rejected
  | "expired";     // Validity period ended

/**
 * Quote Item
 */
export interface QuoteItem {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Quote with items and customer info
 */
export interface Quote {
  id: string;
  requestId: string | null;
  customerId: string;
  invoiceNumber: string | null;
  title: string | null;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  total: string;
  validUntil: string | null;
  status: QuoteStatus;
  rejectionReason: string | null;
  rejectionNote: string | null;
  notes: string | null;
  // Deposit/Balance tracking
  depositAmount: string | null;
  balanceAmount: string | null;
  depositPaidAt: string | null;
  balancePaidAt: string | null;
  // Meta
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  customerName: string | null;
  customerEmail: string | null;
  items: QuoteItem[];
  // Order reference (if order created)
  orderId: string | null;
}

/**
 * Quote list item (without full items)
 */
export interface QuoteListItem {
  id: string;
  requestId: string | null;
  customerId: string;
  invoiceNumber: string | null;
  title: string | null;
  total: string;
  status: QuoteStatus;
  validUntil: string | null;
  createdAt: string;
  sentAt: string | null;
  customerName: string | null;
  customerEmail: string | null;
}

/**
 * Create quote input
 */
export interface CreateQuoteInput {
  requestId?: string;
  customerId: string;
  title?: string;
  notes?: string;
  vatRate?: number;
  validUntil?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: string;
  }[];
}

/**
 * Update quote input (for editing non-paid quotes)
 */
export interface UpdateQuoteInput {
  vatRate?: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: string;
  }[];
}

/**
 * Status display configuration
 */
export const quoteStatusConfig: Record<
  QuoteStatus,
  {
    label: string;
    textColor: string;
    statusColor: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  draft: {
    label: "Draft",
    textColor: "#6B7280",
    statusColor: "#9CA3AF",
    borderColor: "#E5E7EB",
    bgColor: "#F9FAFB",
  },
  sent: {
    label: "Awaiting Deposit",
    textColor: "#1E40AF",
    statusColor: "#3B82F6",
    borderColor: "#DBEAFE",
    bgColor: "#EFF6FF",
  },
  deposit_paid: {
    label: "Deposit Paid",
    textColor: "#7C3AED",
    statusColor: "#8B5CF6",
    borderColor: "#DDD6FE",
    bgColor: "#F5F3FF",
  },
  paid: {
    label: "Fully Paid",
    textColor: "#395214",
    statusColor: "#B3EC3D",
    borderColor: "#B3EC3D",
    bgColor: "#FBFFF4",
  },
  rejected: {
    label: "Rejected",
    textColor: "#FF1603",
    statusColor: "#FF1603",
    borderColor: "#FFE1E1",
    bgColor: "#FFF8F8",
  },
  expired: {
    label: "Expired",
    textColor: "#92400E",
    statusColor: "#F59E0B",
    borderColor: "#FDE68A",
    bgColor: "#FFFBEB",
  },
};

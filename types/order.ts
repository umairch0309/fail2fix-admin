/**
 * Order Types (Admin)
 * Matches backend schema
 */

/**
 * Order Status - matches backend enum
 */
export type OrderStatus =
  | "pending"      // Order created (after deposit paid)
  | "in_progress"  // Work has started
  | "on_hold"      // Temporarily paused
  | "completed"    // Work finished
  | "closed"       // Order closed (after balance paid)
  | "cancelled";   // Order cancelled

/**
 * Quote Item from order details
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
 * Quote Status for order context
 */
export type QuoteStatus =
  | "draft"
  | "sent"
  | "deposit_paid"
  | "paid"
  | "rejected"
  | "expired";

/**
 * Quote details included in order
 */
export interface OrderQuote {
  id: string;
  requestId: string | null;
  invoiceNumber: string | null;
  title: string | null;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  total: string;
  validUntil: string | null;
  status: QuoteStatus;
  notes: string | null;
  createdAt: string;
  sentAt: string | null;
  acceptedAt: string | null;
  // Deposit/Balance tracking
  depositAmount: string | null;
  balanceAmount: string | null;
  depositPaidAt: string | null;
  balancePaidAt: string | null;
  items: QuoteItem[];
}

/**
 * Payment type
 */
export type PaymentType = "deposit" | "balance" | "full";

/**
 * Payment details included in order
 */
export interface OrderPayment {
  id: string;
  quoteId: string;
  orderId: string | null;
  customerId: string;
  amount: string;
  currency: string;
  method: string;
  status: string;
  type: PaymentType;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  transactionId: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order Update type
 */
export type OrderUpdateType = "info" | "warning" | "critical";

/**
 * Order Update from API
 */
export interface OrderUpdate {
  id: string;
  orderId: string;
  type: OrderUpdateType;
  content: string;
  createdBy: string | null;
  createdAt: string;
  createdByName: string | null;
}

/**
 * Create order update input
 */
export interface CreateOrderUpdateInput {
  type: OrderUpdateType;
  content: string;
}

/**
 * Latest update for order list view
 */
export interface OrderLatestUpdate {
  id: string;
  orderId: string;
  type: OrderUpdateType;
  content: string;
  createdAt: string;
}

/**
 * Order from API list (admin view - minimal data)
 */
export interface Order {
  id: string;
  orderNumber: string;
  quoteId: string;
  customerId: string;
  status: OrderStatus;
  scheduledDate: string | null;
  assignedTo: string | null;
  assigneeName: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  customerName: string | null;
  customerEmail: string | null;
  // Quote info
  quoteTitle: string | null;
  quoteTotal: string;
  // Latest update
  latestUpdate: OrderLatestUpdate | null;
}

/**
 * Order detail from API (full data with quote, payments, and updates)
 */
export interface OrderDetail {
  id: string;
  orderNumber: string;
  quoteId: string;
  customerId: string;
  status: OrderStatus;
  scheduledDate: string | null;
  assignedTo: string | null;
  completedAt: string | null;
  completionOtpVerified: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Customer info
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  // Related data
  quote: OrderQuote | null;
  payments: OrderPayment[];
  updates: OrderUpdate[];
}

/**
 * Update order status input
 */
export interface UpdateOrderStatusInput {
  status: "in_progress" | "on_hold" | "completed" | "cancelled";
  notes?: string;
}

/**
 * Status display configuration
 */
export const orderStatusConfig: Record<
  OrderStatus,
  {
    label: string;
    textColor: string;
    statusColor: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  pending: {
    label: "Pending",
    textColor: "#1E40AF",
    statusColor: "#3B82F6",
    borderColor: "#BFDBFE",
    bgColor: "#EFF6FF",
  },
  in_progress: {
    label: "In Progress",
    textColor: "#7C3AED",
    statusColor: "#8B5CF6",
    borderColor: "#DDD6FE",
    bgColor: "#F5F3FF",
  },
  on_hold: {
    label: "On Hold",
    textColor: "#813500",
    statusColor: "#F59E0B",
    borderColor: "#FFE4D2",
    bgColor: "#FFF8F3",
  },
  completed: {
    label: "Completed",
    textColor: "#395214",
    statusColor: "#B3EC3D",
    borderColor: "#B3EC3D",
    bgColor: "#FBFFF4",
  },
  cancelled: {
    label: "Cancelled",
    textColor: "#FF1603",
    statusColor: "#FF1603",
    borderColor: "#FFE1E1",
    bgColor: "#FFF8F8",
  },
  closed: {
    label: "Closed",
    textColor: "#6B7280",
    statusColor: "#9CA3AF",
    borderColor: "#E5E7EB",
    bgColor: "#F9FAFB",
  },
};

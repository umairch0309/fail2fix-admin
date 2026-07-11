/**
 * Request Types (Admin)
 * Matches backend schema with customer info
 */

/**
 * Request Status - matches backend enum
 */
export type RequestStatus =
  | "quote_requested"  // Customer requested a quote
  | "quote_sent"       // Admin sent quote to customer
  | "paid"             // Customer paid, order created
  | "rejected"         // Customer rejected the quote
  | "closed";          // Request closed

/**
 * Quote item (selected defect/repair)
 */
export interface RequestQuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

/**
 * Quote info included with request
 */
export interface RequestQuote {
  id: string;
  status: string;
  title: string | null;
  total: string;
  items: RequestQuoteItem[];
}

/**
 * Request with customer info (admin view)
 */
export interface Request {
  id: string;
  customerId: string;

  // Contact details from request
  name: string;
  email: string;
  phone: string;

  // Vehicle & location
  vrm: string;
  postcode: string;

  // MOT details
  motDetailsUrl?: string | null;
  notes?: string | null;

  // Status
  status: RequestStatus;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Customer info (from join)
  customerName: string | null;
  customerEmail: string | null;

  // Order info (when converted to order)
  orderId: string | null;

  // Quote with selected defects/repairs
  quote?: RequestQuote | null;
}

/**
 * Status display configuration
 */
export const requestStatusConfig: Record<
  RequestStatus,
  {
    label: string;
    textColor: string;
    statusColor: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  quote_requested: {
    label: "Quote Requested",
    textColor: "#813500",
    statusColor: "#F97316",
    borderColor: "#FFE4D2",
    bgColor: "#FFF8F3",
  },
  quote_sent: {
    label: "Quote Sent",
    textColor: "#1E40AF",
    statusColor: "#3B82F6",
    borderColor: "#DBEAFE",
    bgColor: "#EFF6FF",
  },
  paid: {
    label: "Paid",
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
  closed: {
    label: "Closed",
    textColor: "#6B7280",
    statusColor: "#9CA3AF",
    borderColor: "#E5E7EB",
    bgColor: "#F9FAFB",
  },
};

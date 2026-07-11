/**
 * Dashboard Stats Types
 */

export type DateRange = '7days' | '30days' | '90days' | 'all';

export interface QuoteStats {
  total: number;
  totalValue: number;
  open: number;       // draft + sent
  closed: number;     // paid
  rejected: number;
  expired: number;
}

export interface RequestStats {
  total: number;
  pending: number;    // quote_requested
  quoteSent: number;
  paid: number;
  rejected: number;
  closed: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  inProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
}

export interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedAmount: number;
}

export interface CustomerStats {
  total: number;
  newCustomers: number;
  activeCustomers: number;
  bannedCustomers: number;
}

export interface DashboardStats {
  quotes: QuoteStats;
  requests: RequestStats;
  orders: OrderStats;
  payments: PaymentStats;
  customers: CustomerStats;
  avgResponseTime: number | null;
  dateRange: DateRange;
  generatedAt: string;
}

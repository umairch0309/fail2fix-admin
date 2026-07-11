"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  apiGet,
  apiPost,
  isPaginatedResult,
  type PaginatedResponse,
} from "@/lib/api-client";
import type { Payment, RecordPaymentInput } from "@/types/payment";

export function usePayments(options?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.payments.all, options?.page, options?.limit],
    queryFn: async () => {
      const data = await apiGet<Payment[] | PaginatedResponse<Payment>>(
        "/api/payments/admin/all",
        { page: options?.page, limit: options?.limit },
      );

      if (isPaginatedResult(data)) return data;

      return {
        items: data,
        pagination: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
        },
      } satisfies PaginatedResponse<Payment>;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function usePayment(paymentId?: string) {
  return useQuery({
    queryKey: queryKeys.payments.detail(paymentId || ""),
    queryFn: async (): Promise<Payment | null> => {
      if (!paymentId) return null;
      return apiGet<Payment | null>(`/api/payments/admin/${paymentId}`);
    },
    enabled: !!paymentId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: RecordPaymentInput,
    ): Promise<{ payment: Payment; order: unknown }> =>
      apiPost("/api/payments/admin/record", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record payment");
    },
  });
}

export function useRecordDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: RecordPaymentInput,
    ): Promise<{
      payment: Payment;
      order: unknown;
      depositAmount: string;
      balanceAmount: string;
    }> => apiPost("/api/payments/admin/record-deposit", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      toast.success("Deposit recorded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record deposit");
    },
  });
}

export function useRecordBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: RecordPaymentInput,
    ): Promise<{ payment: Payment; balanceAmount: string }> =>
      apiPost("/api/payments/admin/record-balance", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      toast.success("Balance recorded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record balance");
    },
  });
}

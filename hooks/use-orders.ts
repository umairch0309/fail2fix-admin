"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  apiDelete,
  apiFetch,
  apiGet,
  apiPatch,
  apiPost,
  isPaginatedResult,
  type PaginatedResponse,
} from "@/lib/api-client";
import type {
  Order,
  OrderDetail,
  OrderUpdate,
  UpdateOrderStatusInput,
  CreateOrderUpdateInput,
} from "@/types/order";

export function useOrders(options?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.orders.all, options?.page, options?.limit],
    queryFn: async () => {
      const data = await apiGet<Order[] | PaginatedResponse<Order>>(
        "/api/orders/admin/all",
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
      } satisfies PaginatedResponse<Order>;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrder(orderId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId || ""),
    queryFn: async (): Promise<OrderDetail | null> => {
      if (!orderId) return null;
      return apiGet<OrderDetail | null>(`/api/orders/admin/${orderId}`);
    },
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      input,
    }: {
      orderId: string;
      input: UpdateOrderStatusInput;
    }): Promise<Order> =>
      apiPatch<Order>(`/api/orders/admin/${orderId}/status`, input),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(orderId),
      });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update order status");
    },
  });
}

export function useCreateOrderUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      input,
    }: {
      orderId: string;
      input: CreateOrderUpdateInput;
    }): Promise<OrderUpdate> =>
      apiPost<OrderUpdate>(`/api/orders/admin/${orderId}/updates`, input),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(orderId),
      });
      toast.success("Update added");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add update");
    },
  });
}

export function useDeleteOrderUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      updateId,
    }: {
      updateId: string;
      orderId: string;
    }): Promise<OrderUpdate> =>
      apiDelete<OrderUpdate>(`/api/orders/admin/updates/${updateId}`),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(orderId),
      });
      toast.success("Update deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete update");
    },
  });
}

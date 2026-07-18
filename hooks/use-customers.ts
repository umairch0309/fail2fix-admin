"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPostWithMessage,
  apiPut,
  isPaginatedResult,
  type PaginatedResponse,
} from "@/lib/api-client";
import type { Customer, UpdateCustomerInput } from "@/types/customer";

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
}

export function useCustomers(options?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.customers.all, options?.page, options?.limit],
    queryFn: async () => {
      const data = await apiGet<Customer[] | PaginatedResponse<Customer>>(
        "/api/customers",
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
      } satisfies PaginatedResponse<Customer>;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: queryKeys.customers.search(query),
    queryFn: async (): Promise<Customer[]> => {
      if (!query.trim()) return [];
      return apiGet<Customer[]>("/api/customers/search", { q: query });
    },
    enabled: query.trim().length > 0,
    staleTime: 30 * 1000,
  });
}

export function useCustomer(customerId?: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(customerId || ""),
    queryFn: async (): Promise<Customer | null> => {
      if (!customerId) return null;
      return apiGet<Customer | null>(`/api/customers/${customerId}`);
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
  });
}

export interface CreateCustomerResult extends Customer {
  invitationEmailSent?: boolean;
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCustomerInput) => {
      const { data, message } = await apiPostWithMessage<CreateCustomerResult>(
        "/api/customers",
        input,
      );
      return { customer: data, message };
    },
    onSuccess: ({ customer, message }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });

      const toastMessage =
        message ||
        (customer.invitationEmailSent
          ? "Customer created! Invitation email sent."
          : "Customer created, but the invitation email could not be sent.");

      if (customer.invitationEmailSent === false) {
        toast.warning(toastMessage);
        return;
      }

      toast.success(toastMessage);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create customer");
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      data,
    }: {
      customerId: string;
      data: UpdateCustomerInput;
    }): Promise<Customer> =>
      apiPut<Customer>(`/api/customers/${customerId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(variables.customerId),
      });
      toast.success("Customer updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update customer");
    },
  });
}

export function useBanCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      reason,
    }: {
      customerId: string;
      reason?: string;
    }): Promise<Customer> =>
      apiPost<Customer>(`/api/customers/${customerId}/ban`, { reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(variables.customerId),
      });
      toast.success("Customer banned successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to ban customer");
    },
  });
}

export function useUnbanCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string): Promise<Customer> =>
      apiPost<Customer>(`/api/customers/${customerId}/unban`),
    onSuccess: (_, customerId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(customerId),
      });
      toast.success("Customer unbanned successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unban customer");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string): Promise<void> =>
      apiDelete<void>(`/api/customers/${customerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success("Customer deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete customer");
    },
  });
}

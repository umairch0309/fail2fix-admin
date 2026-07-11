"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  apiDelete,
  apiFetch,
  apiGet,
  apiPost,
  isPaginatedResult,
  type PaginatedResponse,
} from "@/lib/api-client";
import type { Quote, QuoteListItem, CreateQuoteInput, UpdateQuoteInput } from "@/types/quote";

export function useQuotes(options?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.quotes.all, options?.page, options?.limit],
    queryFn: async () => {
      const data = await apiGet<
        QuoteListItem[] | PaginatedResponse<QuoteListItem>
      >("/api/quotes/admin/all", {
        page: options?.page,
        limit: options?.limit,
      });

      if (isPaginatedResult(data)) {
        return data;
      }

      return {
        items: data,
        pagination: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
        },
      } satisfies PaginatedResponse<QuoteListItem>;
    },
    staleTime: 0,
  });
}

export function useQuote(quoteId?: string) {
  return useQuery({
    queryKey: queryKeys.quotes.detail(quoteId || ""),
    queryFn: async (): Promise<Quote | null> => {
      if (!quoteId) return null;
      return apiGet<Quote | null>(`/api/quotes/admin/${quoteId}`);
    },
    enabled: !!quoteId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useQuotesByRequest(requestId?: string) {
  return useQuery({
    queryKey: queryKeys.quotes.byRequest(requestId || ""),
    queryFn: async (): Promise<Quote[]> => {
      if (!requestId) return [];
      return apiGet<Quote[]>(`/api/quotes/admin/request/${requestId}`);
    },
    enabled: !!requestId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuoteInput): Promise<Quote> =>
      apiPost<Quote>("/api/quotes/admin", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      toast.success("Quote created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create quote");
    },
  });
}

export function useSendQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string): Promise<Quote> =>
      apiPost<Quote>(`/api/quotes/admin/${quoteId}/send`),
    onSuccess: (_, quoteId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotes.detail(quoteId),
      });
      toast.success("Quote sent to customer");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send quote");
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string): Promise<void> => {
      await apiDelete(`/api/quotes/admin/${quoteId}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
    },
    onSuccess: () => {
      toast.success("Quote deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete quote");
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quoteId,
      input,
    }: {
      quoteId: string;
      input: UpdateQuoteInput;
    }): Promise<Quote> =>
      apiFetch<Quote>(`/api/quotes/admin/${quoteId}/items`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: (_, { quoteId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotes.detail(quoteId),
      });
      toast.success("Quote updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update quote");
    },
  });
}

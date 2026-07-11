"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  apiGet,
  apiPatch,
  apiDelete,
  isPaginatedResult,
  type PaginatedResponse,
} from "@/lib/api-client";
import type { Request, RequestStatus } from "@/types/request";
import { toast } from "@/components/ui/sonner";

export function useRequests(options?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.requests.all, options?.page, options?.limit],
    queryFn: async () => {
      const data = await apiGet<Request[] | PaginatedResponse<Request>>(
        "/api/requests/admin/all",
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
      } satisfies PaginatedResponse<Request>;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useRequest(requestId?: string) {
  return useQuery({
    queryKey: queryKeys.requests.detail(requestId || ""),
    queryFn: async (): Promise<Request | null> => {
      if (!requestId) return null;
      return apiGet<Request | null>(`/api/requests/admin/${requestId}`);
    },
    enabled: !!requestId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string): Promise<void> => {
      await apiDelete(`/api/requests/admin/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      toast.success("Request deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete request");
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: string;
      status: RequestStatus;
    }): Promise<Request> =>
      apiPatch<Request>(`/api/requests/admin/${requestId}/status`, { status }),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requests.detail(requestId),
      });
      toast.success("Request status updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update request status");
    },
  });
}

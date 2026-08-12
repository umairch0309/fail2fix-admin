"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiGet, apiPost } from "@/lib/api-client";
import type { ChatMessage, ChatWithCustomer } from "@/types/chat";

const MESSAGES_PER_PAGE = 20;

export function useChats() {
  return useQuery({
    queryKey: queryKeys.chats.all,
    queryFn: async (): Promise<ChatWithCustomer[]> =>
      apiGet<ChatWithCustomer[]>("/api/chat/admin/all"),
    staleTime: 30 * 1000,
  });
}

export function useChatMessages(chatId: string | null) {
  return useInfiniteQuery({
    queryKey: queryKeys.chats.messages(chatId || ""),
    queryFn: async ({ pageParam }): Promise<ChatMessage[]> => {
      if (!chatId) return [];

      return apiGet<ChatMessage[]>(`/api/chat/admin/${chatId}/messages`, {
        limit: MESSAGES_PER_PAGE,
        offset: pageParam,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < MESSAGES_PER_PAGE) {
        return undefined;
      }
      return allPages.flat().length;
    },
    enabled: !!chatId,
    staleTime: 30 * 1000,
    refetchOnMount: "always",
  });
}

export async function markChatAsRead(chatId: string): Promise<void> {
  await apiPost(`/api/chat/admin/${chatId}/read`);
}

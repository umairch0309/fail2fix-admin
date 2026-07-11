"use client";

import { useEffect } from "react";
import Singlechat from "@/components/dashboard/singlechat";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useWebSocketStore } from "@/stores/websocket-store";
import { useChats } from "@/hooks/use-chat";
import { Loader2, MessageCircle } from "lucide-react";
import { ListEmptyState } from "@/components/list-empty-state";

export default function ChatsPage() {
  const router = useRouter();
  const setHeader = useDashboardStore((state) => state.setHeader);
  const unreadCounts = useWebSocketStore((state) => state.unreadCounts);
  const lastMessageTimes = useWebSocketStore((state) => state.lastMessageTimes);
  const lastMessagesMap = useWebSocketStore((state) => state.lastMessages);

  // Fetch chats from API
  const { data: chats = [], isLoading } = useChats();

  useEffect(() => {
    setHeader({
      title: "Chats",
      description: "Manage your conversations",
      showBreadcrumbs: false,
      showButton: false,
    });

    // On desktop, redirect to first chat if exists
    if (chats.length > 0 && window.innerWidth >= 768) {
      router.replace(`/chats/${chats[0].id}`);
    }
  }, [setHeader, router, chats]);

  // Format time for display
  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[#81868C]" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Chat List Only */}
      <div className="md:hidden bg-[#FAFAFA] h-full overflow-y-auto rounded-xl">
        {chats.length === 0 ? (
          <ListEmptyState
            icon={MessageCircle}
            title="No chats yet"
            description="Customer conversations will appear here once they start messaging."
          />
        ) : (
          chats.map((chat) => {
            const realtimeTime = lastMessageTimes[chat.id];
            const displayTime = realtimeTime
              ? formatTime(new Date(realtimeTime).toISOString())
              : formatTime(chat.lastMessageAt || chat.createdAt);
            const displayMessage = lastMessagesMap[chat.id] || chat.lastMessage || "No messages yet";

            return (
              <div key={chat.id} onClick={() => router.push(`/chats/${chat.id}`)} className="cursor-pointer">
                <Singlechat
                  id={chat.id}
                  name={chat.customerName || "Customer"}
                  message={displayMessage}
                  count={unreadCounts[chat.id] || 0}
                  seen={(unreadCounts[chat.id] || 0) === 0}
                  time={displayTime}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Desktop: Full Layout - Hidden on mobile, shown on tablet+ */}
      <div className="hidden md:grid grid-cols-[280px_1fr] h-full">
        <div className="bg-[#FAFAFA] border-r border-[#EAEAEA] overflow-y-auto rounded-l-xl">
          {chats.length === 0 ? (
            <ListEmptyState
              icon={MessageCircle}
              title="No chats yet"
              description="Customer conversations will appear here once they start messaging."
            />
          ) : (
            chats.map((chat) => {
              const realtimeTime = lastMessageTimes[chat.id];
              const displayTime = realtimeTime
                ? formatTime(new Date(realtimeTime).toISOString())
                : formatTime(chat.lastMessageAt || chat.createdAt);
              const displayMessage = lastMessagesMap[chat.id] || chat.lastMessage || "No messages yet";

              return (
                <div key={chat.id} onClick={() => router.push(`/chats/${chat.id}`)} className="cursor-pointer">
                  <Singlechat
                    id={chat.id}
                    name={chat.customerName || "Customer"}
                    message={displayMessage}
                    count={unreadCounts[chat.id] || 0}
                    seen={(unreadCounts[chat.id] || 0) === 0}
                    time={displayTime}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Empty state for desktop when no chat is selected */}
        <div className="bg-[#F5F5F5] flex items-center justify-center rounded-r-xl">
          <ListEmptyState
            icon={MessageCircle}
            title="Select a chat"
            description="Choose a conversation from the list to start messaging."
          />
        </div>
      </div>
    </>
  );
}

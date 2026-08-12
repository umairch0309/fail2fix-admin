"use client";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Chatbox from "@/components/dashboard/chatbox";
import Chatinput from "@/components/dashboard/chatinput";
import QuoteRequestCard from "@/components/dashboard/quote-request-card";
import QuoteDetailsSheet from "@/components/dashboard/quote-details-sheet";
import Singlechat from "@/components/dashboard/singlechat";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useWebSocketStore } from "@/stores/websocket-store";
import { useChats, useChatMessages, markChatAsRead } from "@/hooks/use-chat";
import { queryKeys } from "@/lib/query-keys";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * Format timestamp to readable time
 */
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get minute key for grouping (sender + minute)
 */
const getMinuteKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes()}`;
};

/**
 * Check if message should show time
 */
const shouldShowTime = (
  messages: { senderId: string; timestamp: number }[],
  index: number
): boolean => {
  const current = messages[index];
  const next = messages[index + 1];

  if (!next) return true;
  if (current.senderId !== next.senderId) return true;
  if (getMinuteKey(current.timestamp) !== getMinuteKey(next.timestamp)) return true;

  return false;
};

/**
 * Check if message is grouped with the previous one
 */
const isGroupedWithPrevious = (
  messages: { senderId: string; timestamp: number }[],
  index: number
): boolean => {
  const current = messages[index];
  const prev = messages[index - 1];

  if (!prev) return false;

  return (
    current.senderId === prev.senderId &&
    getMinuteKey(current.timestamp) === getMinuteKey(prev.timestamp)
  );
};

/**
 * Format time for sidebar display
 */
const formatSidebarTime = (date: Date | string | null) => {
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

export default function ChatConversationPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;
  const queryClient = useQueryClient();
  const setHeader = useDashboardStore((state) => state.setHeader);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileEndRef = useRef<HTMLDivElement>(null);
  const desktopEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const isDesktopViewport = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;

  const getActiveScrollEl = () =>
    isDesktopViewport() ? desktopScrollRef.current : mobileScrollRef.current;

  const scrollActiveEndIntoView = (behavior: ScrollBehavior) => {
    const end = isDesktopViewport()
      ? desktopEndRef.current
      : mobileEndRef.current;
    end?.scrollIntoView({ behavior });
  };

  // Sheet state
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleViewDetails = useCallback((requestId: string) => {
    setSelectedRequestId(requestId);
    setIsSheetOpen(true);
  }, []);

  const handleCreateQuote = useCallback((requestId: string) => {
    setIsSheetOpen(false);
    router.push(`/quotes/new/create?requestId=${requestId}`);
  }, [router]);

  // WebSocket store
  const setActiveChat = useWebSocketStore((state) => state.setActiveChat);
  const realtimeMessages = useWebSocketStore((state) => state.messages);
  const sendMessage = useWebSocketStore((state) => state.sendMessage);
  const sendTyping = useWebSocketStore((state) => state.sendTyping);
  const isConnected = useWebSocketStore((state) => state.state === "connected");
  const userId = useWebSocketStore((state) => state.userId);
  const wsMarkAsRead = useWebSocketStore((state) => state.markAsRead);
  const clearMessages = useWebSocketStore((state) => state.clearMessages);
  const isOtherPartyOnline = useWebSocketStore((state) => state.isOtherPartyOnline);
  const isOtherPartyTyping = useWebSocketStore((state) => state.isOtherPartyTyping);
  const unreadCounts = useWebSocketStore((state) => state.unreadCounts);
  const lastMessageTimes = useWebSocketStore((state) => state.lastMessageTimes);
  const lastMessagesMap = useWebSocketStore((state) => state.lastMessages);

  // Fetch all chats for sidebar
  const { data: chats = [] } = useChats();

  // Fetch messages for this chat
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(chatId);

  // Current chat data
  const currentChat = chats.find((chat) => chat.id === chatId);

  // Flatten pages and merge with real-time messages
  const messages = useMemo(() => {
    const allApiMessages = data?.pages ? [...data.pages].reverse().flat() : [];

    // Map API messages to include _type and _quoteRequest for rendering
    const apiFormatted = allApiMessages.map((msg) => ({
      senderId: msg.senderId,
      content: msg.content,
      timestamp: new Date(msg.createdAt).getTime(),
      senderRole: msg.senderRole as string | null | undefined,
      _type: msg.messageType as "chat" | "quote_request" | undefined,
      _quoteRequest: msg.messageType === "quote_request" && msg.metadata
        ? msg.metadata as typeof realtimeMessages[0]["_quoteRequest"]
        : undefined,
    }));

    const latestApiTimestamp = apiFormatted.length > 0
      ? Math.max(...apiFormatted.map((m) => m.timestamp))
      : 0;

    const newRealtimeMessages = realtimeMessages.filter(
      (msg) => msg.timestamp > latestApiTimestamp
    );

    return [...apiFormatted, ...newRealtimeMessages];
  }, [data?.pages, realtimeMessages]);

  // Handle scroll to load more (use visible pane only)
  const handleScroll = useCallback(() => {
    const container = getActiveScrollEl();
    if (!container || isFetchingNextPage || !hasNextPage) return;

    if (container.scrollTop < 100) {
      const prevScrollHeight = container.scrollHeight;

      fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          const active = getActiveScrollEl();
          if (active) {
            const newScrollHeight = active.scrollHeight;
            active.scrollTop = newScrollHeight - prevScrollHeight;
          }
        });
      });
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    setHeader({
      title: "",
      description: "",
      showBreadcrumbs: false,
      showButton: false,
    });

    // Set active chat for filtering messages
    setActiveChat(chatId);
    isInitialLoad.current = true;

    // Mark messages as read
    wsMarkAsRead(chatId);
    markChatAsRead(chatId);

    return () => {
      clearMessages();
    };
  }, [setHeader, setActiveChat, chatId, wsMarkAsRead, clearMessages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0 && !isLoading) {
      scrollActiveEndIntoView("instant");
      isInitialLoad.current = false;
    }
  }, [messages, isLoading, chatId]);

  // Scroll to bottom on new messages and refetch chats list
  useEffect(() => {
    if (!isInitialLoad.current && realtimeMessages.length > 0) {
      scrollActiveEndIntoView("smooth");
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    }
  }, [realtimeMessages, queryClient]);

  const handleSend = (content: string) => {
    sendMessage(content);
    sendTyping(false);
  };

  const handleTyping = useCallback((isTyping: boolean) => {
    sendTyping(isTyping);
  }, [sendTyping]);

  // Online/typing status indicator
  const OnlineStatus = () => {
    if (isOtherPartyTyping) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-[#ff8c32]">
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-[#ff8c32] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-[#ff8c32] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-[#ff8c32] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span>typing...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-xs text-[#81868C]">
        <div className={`w-2 h-2 rounded-full ${isOtherPartyOnline ? "bg-green-500" : "bg-gray-400"}`} />
        <span>{isOtherPartyOnline ? "Online" : "Offline"}</span>
      </div>
    );
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden flex flex-col h-full rounded-xl overflow-hidden">
        {/* Mobile Header */}
        <div className="bg-[#FAFAFA] border-b border-[#EAEAEA] p-4 flex items-center gap-3">
          <button onClick={() => router.push('/chats')} className="p-1">
            <ArrowLeft size={20} />
          </button>
          <Avatar className="h-10 w-10">
            <AvatarFallback
              className="text-white font-semibold text-sm"
              style={{ background: "linear-gradient(180deg, #ff8c32 0%, #FF9F5A 100%)" }}
            >
              {(currentChat?.customerName || "C")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-base">{currentChat?.customerName || "Customer"}</h2>
            <OnlineStatus />
          </div>
        </div>

        {/* Mobile Chat Area */}
        <div
          ref={mobileScrollRef}
          onScroll={handleScroll}
          className="bg-[#F5F5F5] flex-1 px-4 py-4 flex flex-col overflow-y-auto"
        >
          <div className="flex flex-col gap-4 flex-1">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#81868C]" />
              </div>
            )}

            {hasNextPage && !isFetchingNextPage && (
              <div className="text-center text-xs text-[#81868C] py-2">
                Scroll up to load older messages
              </div>
            )}

            <div className="w-full flex justify-center">
              <div className="text-[0.8rem] font-medium text-[#81868C]">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            <div className="py-2 flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#81868C]" />
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">
                  Failed to load messages
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-[#81868C] py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, index) => {
                  const showTime = shouldShowTime(messages, index);
                  const isGrouped = isGroupedWithPrevious(messages, index);

                  // Render quote request card
                  if (msg._type === "quote_request" && msg._quoteRequest) {
                    return (
                      <div
                        key={`${msg.timestamp}-${index}`}
                        className="mt-3 first:mt-0"
                      >
                        <QuoteRequestCard
                          quoteRequest={msg._quoteRequest}
                          time={formatTime(msg.timestamp)}
                          showTime={showTime}
                          onViewDetails={handleViewDetails}
                        />
                      </div>
                    );
                  }

                  // Render regular chat message
                  return (
                    <div
                      key={`${msg.timestamp}-${index}`}
                      className={isGrouped ? "mt-1" : "mt-3 first:mt-0"}
                    >
                      <Chatbox
                        message={msg.content}
                        time={formatTime(msg.timestamp)}
                        isOwn={
                          "senderRole" in msg && msg.senderRole
                            ? msg.senderRole === "admin"
                            : msg.senderId === userId
                        }
                        showTime={showTime}
                        isGrouped={isGrouped}
                      />
                    </div>
                  );
                })
              )}
              <div ref={mobileEndRef} />
            </div>
          </div>
        </div>

        {/* Mobile Chat Input */}
        <div className="bg-[#F5F5F5] p-4 border-t border-[#EAEAEA] space-y-2">
          {!isConnected && (
            <p className="text-center text-xs text-[#813500] bg-[#FFF8F3] border border-[#FFE4D2] rounded-lg px-3 py-2">
              Reconnecting to chat… Messages can&apos;t be sent until you&apos;re back online.
            </p>
          )}
          <Chatinput onSend={handleSend} onTyping={handleTyping} disabled={!isConnected} />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-[280px_1fr] h-full">
        {/* Chat List Sidebar */}
        <div className="bg-[#FAFAFA] border-r border-[#EAEAEA] overflow-y-auto rounded-l-xl">
          {chats.map((chat) => {
            // Use real-time data if available, otherwise fall back to API data
            const realtimeTime = lastMessageTimes[chat.id];
            const displayTime = realtimeTime
              ? formatSidebarTime(new Date(realtimeTime).toISOString())
              : formatSidebarTime(chat.lastMessageAt || chat.createdAt);
            const displayMessage = lastMessagesMap[chat.id] || chat.lastMessage || "No messages yet";

            return (
              <div
                key={chat.id}
                onClick={() => router.push(`/chats/${chat.id}`)}
                className={`cursor-pointer ${chat.id === chatId ? "bg-[#F0F0F0]" : ""}`}
              >
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
          })}
        </div>

        {/* Chat Conversation */}
        <div className="flex flex-col rounded-r-xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#FAFAFA] border-b border-[#EAEAEA] p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className="text-white font-semibold text-sm"
                style={{ background: "linear-gradient(180deg, #ff8c32 0%, #FF9F5A 100%)" }}
              >
                {(currentChat?.customerName || "C")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-base">{currentChat?.customerName || "Customer"}</h2>
              <OnlineStatus />
            </div>
          </div>

          {/* Chat Messages Area */}
          <div
            ref={desktopScrollRef}
            onScroll={handleScroll}
            className="bg-[#F5F5F5] px-6 py-4 flex flex-col flex-1 overflow-y-auto"
          >
            <div className="flex flex-col gap-4 flex-1">
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#81868C]" />
                </div>
              )}

              {hasNextPage && !isFetchingNextPage && (
                <div className="text-center text-xs text-[#81868C] py-2">
                  Scroll up to load older messages
                </div>
              )}

              <div className="w-full flex justify-center">
                <div className="text-[0.8rem] font-medium text-[#81868C]">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="py-2 flex flex-col">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#81868C]" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">
                    Failed to load messages
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-[#81868C] py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const showTime = shouldShowTime(messages, index);
                    const isGrouped = isGroupedWithPrevious(messages, index);

                    // Render quote request card
                    if (msg._type === "quote_request" && msg._quoteRequest) {
                      return (
                        <div
                          key={`${msg.timestamp}-${index}`}
                          className="mt-3 first:mt-0"
                        >
                          <QuoteRequestCard
                            quoteRequest={msg._quoteRequest}
                            time={formatTime(msg.timestamp)}
                            showTime={showTime}
                            onViewDetails={handleViewDetails}
                          />
                        </div>
                      );
                    }

                    // Render regular chat message
                    return (
                      <div
                        key={`${msg.timestamp}-${index}`}
                        className={isGrouped ? "mt-1" : "mt-3 first:mt-0"}
                      >
                        <Chatbox
                          message={msg.content}
                          time={formatTime(msg.timestamp)}
                          isOwn={
                            "senderRole" in msg && msg.senderRole
                              ? msg.senderRole === "admin"
                              : msg.senderId === userId
                          }
                          showTime={showTime}
                          isGrouped={isGrouped}
                        />
                      </div>
                    );
                  })
                )}
                <div ref={desktopEndRef} />
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="bg-[#F5F5F5] p-4 border-t border-[#EAEAEA] space-y-2">
            {!isConnected && (
              <p className="text-center text-xs text-[#813500] bg-[#FFF8F3] border border-[#FFE4D2] rounded-lg px-3 py-2">
                Reconnecting to chat… Messages can&apos;t be sent until you&apos;re back online.
              </p>
            )}
            <Chatinput onSend={handleSend} onTyping={handleTyping} disabled={!isConnected} />
          </div>
        </div>
      </div>

      {/* Quote Details Sheet */}
      <QuoteDetailsSheet
        requestId={selectedRequestId}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onCreateQuote={handleCreateQuote}
      />
    </>
  );
}

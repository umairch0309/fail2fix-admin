import { create } from "zustand";
import { toast } from "@/components/ui/sonner";
import { WS_URL } from "@/lib/constants";
import { showBrowserNotification } from "@/lib/notification-sound";
import type { WSMessage, ChatPayload, ConnectionPayload, PresencePayload, TypingPayload, QuoteRequestPayload, NotificationPayload } from "@/types/websocket";

type WSConnectionState = "connecting" | "connected" | "disconnected" | "error";

export type WebSocketState = {
  // Connection state
  socket: WebSocket | null;
  state: WSConnectionState;
  connectionId: string | null;
  userId: string | null;

  // Active chat (admin selects which chat to view)
  activeChatId: string | null;

  // Messages for active chat
  messages: ChatPayload[];
  unreadCounts: Record<string, number>; // chatId -> unread count
  lastMessageTimes: Record<string, number>; // chatId -> timestamp
  lastMessages: Record<string, string>; // chatId -> last message content

  // Notifications
  notifications: NotificationPayload[];
  unreadNotificationCount: number;

  // Presence - is the customer online?
  isOtherPartyOnline: boolean;
  otherPartyRole: "admin" | "customer" | null;

  // Typing indicator
  isOtherPartyTyping: boolean;
};

export type WebSocketActions = {
  // Connection
  connect: () => void;
  disconnect: () => void;

  // Chat selection
  setActiveChat: (chatId: string | null) => void;
  subscribeToChat: (chatId: string) => void;
  unsubscribeFromChat: (chatId: string) => void;

  // Messages
  sendMessage: (content: string) => boolean;
  clearMessages: () => void;
  markAsRead: (chatId: string) => void;

  // Typing
  sendTyping: (isTyping: boolean) => void;

  // Notifications
  addNotification: (notification: NotificationPayload) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
};

export type WebSocketStore = WebSocketState & WebSocketActions;

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  // Initial state
  socket: null,
  state: "disconnected",
  connectionId: null,
  userId: null,
  activeChatId: null,
  lastMessageTimes: {},
  lastMessages: {},
  messages: [],
  unreadCounts: {},
  notifications: [],
  unreadNotificationCount: 0,
  isOtherPartyOnline: false,
  otherPartyRole: null,
  isOtherPartyTyping: false,

  // Connect to WebSocket
  connect: () => {
    const { socket } = get();

    // Don't connect on server or if already connected
    if (typeof window === "undefined") return;
    if (socket?.readyState === WebSocket.OPEN) return;

    // Close existing
    if (socket) {
      socket.close();
    }

    set({ state: "connecting" });

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      set({ state: "connected", socket: ws });
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;

        // Handle connected message
        if (message.type === "connected") {
          const payload = message.payload as ConnectionPayload;
          set({
            connectionId: payload.connectionId,
            userId: payload.userId ?? null,
          });
        }

        // Handle presence updates
        if (message.type === "presence" && message.topic?.startsWith("chat:")) {
          const presencePayload = message.payload as PresencePayload;
          const { userId, activeChatId } = get();
          const chatId = message.topic.replace("chat:", "");

          // Only care about other party's presence in active chat
          if (presencePayload.userId !== userId && chatId === activeChatId) {
            set({
              isOtherPartyOnline: presencePayload.isOnline,
              otherPartyRole: presencePayload.userRole,
            });
          }
        }

        // Handle typing indicators
        if (message.type === "typing" && message.topic?.startsWith("chat:")) {
          const typingPayload = message.payload as TypingPayload;
          const { userId, activeChatId } = get();
          const chatId = message.topic.replace("chat:", "");

          // Only care about other party's typing in active chat
          if (typingPayload.userId !== userId && chatId === activeChatId) {
            set({ isOtherPartyTyping: typingPayload.isTyping });

            // Auto-clear typing indicator after 3 seconds
            if (typingPayload.isTyping) {
              if (typingTimeout) clearTimeout(typingTimeout);
              typingTimeout = setTimeout(() => {
                set({ isOtherPartyTyping: false });
              }, 3000);
            }
          }
        }

        // Handle chat messages
        if (message.type === "chat" && message.topic?.startsWith("chat:")) {
          const chatPayload = message.payload as ChatPayload;
          const { userId, activeChatId, messages, unreadCounts, lastMessageTimes, lastMessages } = get();
          const chatId = message.topic.replace("chat:", "");

          // Clear typing indicator when message received
          set({ isOtherPartyTyping: false });

          // Update last message time and content for this chat
          set({
            lastMessageTimes: {
              ...lastMessageTimes,
              [chatId]: chatPayload.timestamp,
            },
            lastMessages: {
              ...lastMessages,
              [chatId]: chatPayload.content,
            },
          });

          // If message is for active chat, add to messages
          if (chatId === activeChatId) {
            set({ messages: [...messages, chatPayload] });
          }

          // If message is from customer (not us), increment unread
          if (chatPayload.senderId !== userId) {
            // Only increment if not viewing that chat
            if (chatId !== activeChatId || !window.location.pathname.includes("/chats")) {
              set({
                unreadCounts: {
                  ...unreadCounts,
                  [chatId]: (unreadCounts[chatId] || 0) + 1,
                },
              });
              const messagePreview = chatPayload.content.slice(0, 50) + (chatPayload.content.length > 50 ? "..." : "");
              toast.message("New message from customer", {
                description: messagePreview,
                sound: true, // Play sound for incoming messages
              });
              // Show browser notification for background alerts (no sound - toast handles it)
              showBrowserNotification({
                title: "New message from customer",
                body: messagePreview,
                playSound: false,
                tag: `chat-${chatId}`,
                onClick: () => {
                  window.location.href = `/chats?id=${chatId}`;
                },
              });
            }
          }
        }

        // Handle quote request messages - display as UI card in chat
        if (message.type === "quote_request" && message.topic?.startsWith("chat:")) {
          const quotePayload = message.payload as QuoteRequestPayload;
          const { activeChatId, messages, unreadCounts, lastMessageTimes, lastMessages } = get();
          const chatId = message.topic.replace("chat:", "");

          // Create a chat message with quote request data (from customer)
          const quoteMessage: ChatPayload = {
            senderId: quotePayload.customerId,
            content: `Quote requested for ${quotePayload.vrm}`,
            timestamp: new Date(quotePayload.createdAt).getTime(),
            _type: "quote_request",
            _quoteRequest: quotePayload,
          };

          // Update last message time and content for this chat
          set({
            lastMessageTimes: {
              ...lastMessageTimes,
              [chatId]: quoteMessage.timestamp,
            },
            lastMessages: {
              ...lastMessages,
              [chatId]: quoteMessage.content,
            },
          });

          // If message is for active chat, add to messages
          if (chatId === activeChatId) {
            set({ messages: [...messages, quoteMessage] });
          }

          // Show notification and increment unread count
          if (chatId !== activeChatId || !window.location.pathname.includes("/chats")) {
            set({
              unreadCounts: {
                ...unreadCounts,
                [chatId]: (unreadCounts[chatId] || 0) + 1,
              },
            });
            const requestDescription = `VRM: ${quotePayload.vrm} | Postcode: ${quotePayload.postcode}`;
            toast.request("New quote request", {
              description: requestDescription,
              sound: true, // Play sound for incoming requests
            });
            // Show browser notification for background alerts (no sound - toast handles it)
            showBrowserNotification({
              title: "New quote request",
              body: requestDescription,
              playSound: false,
              tag: `quote-${quotePayload.vrm}`,
              onClick: () => {
                window.location.href = `/chats?id=${chatId}`;
              },
            });
          }
        }

        // Handle notification messages
        if (message.type === "notification") {
          const notification = message.payload as NotificationPayload;
          const { notifications } = get();

          // Add to notifications (newest first)
          set({
            notifications: [notification, ...notifications],
            unreadNotificationCount: get().unreadNotificationCount + 1,
          });

          // Show toast notification - use order toast for paid orders (happy cha-ching!)
          if (notification.data?.orderId) {
            toast.order(notification.title, {
              description: notification.message,
              sound: true,
            });
          } else {
            toast.info(notification.title, {
              description: notification.message,
              sound: true,
            });
          }

          // Show browser notification
          showBrowserNotification({
            title: notification.title,
            body: notification.message,
            playSound: false,
            tag: `notification-${notification.id}`,
            onClick: () => {
              if (notification.data?.orderId) {
                window.location.href = `/orders/${notification.data.orderId}`;
              } else if (notification.data?.requestId) {
                window.location.href = `/requests`;
              }
            },
          });
        }
      } catch (error) {
        console.error("[WS] Parse error:", error);
      }
    };

    ws.onclose = () => {
      set({ state: "disconnected", socket: null, connectionId: null });

      // Auto reconnect
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          get().connect();
        }, 3000);
      }
    };

    ws.onerror = () => {
      set({ state: "error" });
    };

    set({ socket: ws });
  },

  // Disconnect
  disconnect: () => {
    const { socket } = get();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (socket) {
      socket.close();
    }
    set({
      socket: null,
      state: "disconnected",
      connectionId: null,
      activeChatId: null,
      messages: [],
    });
  },

  // Set active chat
  // Note: Admin is already subscribed to all chats by the backend on connection,
  // so we don't need to send subscribe/unsubscribe messages here
  setActiveChat: (chatId: string | null) => {
    // Clear messages and presence state for the new active chat
    set({
      activeChatId: chatId,
      messages: [],
      isOtherPartyOnline: false,
      isOtherPartyTyping: false,
    });
  },

  // Subscribe to a chat topic
  subscribeToChat: (chatId: string) => {
    const { socket } = get();

    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "subscribe",
        topic: `chat:${chatId}`,
        timestamp: Date.now(),
      })
    );
  },

  // Unsubscribe from a chat topic
  unsubscribeFromChat: (chatId: string) => {
    const { socket } = get();

    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "unsubscribe",
        topic: `chat:${chatId}`,
        timestamp: Date.now(),
      })
    );
  },

  // Send message
  sendMessage: (content: string) => {
    const { socket, activeChatId } = get();

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("[WS] Not connected");
      return false;
    }

    if (!activeChatId) {
      console.warn("[WS] No active chat");
      return false;
    }

    socket.send(
      JSON.stringify({
        type: "chat",
        topic: `chat:${activeChatId}`,
        payload: content,
        timestamp: Date.now(),
      })
    );
    return true;
  },

  // Clear messages
  clearMessages: () => set({ messages: [] }),

  // Mark as read
  markAsRead: (chatId: string) => {
    const { unreadCounts } = get();
    set({
      unreadCounts: {
        ...unreadCounts,
        [chatId]: 0,
      },
    });
  },

  // Send typing indicator
  sendTyping: (isTyping: boolean) => {
    const { socket, activeChatId } = get();

    if (!socket || socket.readyState !== WebSocket.OPEN || !activeChatId) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "typing",
        topic: `chat:${activeChatId}`,
        payload: { isTyping },
        timestamp: Date.now(),
      })
    );
  },

  // Add notification
  addNotification: (notification: NotificationPayload) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadNotificationCount: state.unreadNotificationCount + 1,
    }));
  },

  // Mark notification as read
  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
    }));
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationCount: 0,
    }));
  },

  // Clear notifications
  clearNotifications: () => set({ notifications: [], unreadNotificationCount: 0 }),
}));

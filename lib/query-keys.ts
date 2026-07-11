/**
 * React Query Keys
 *
 * Centralized location for all query keys used in the application
 */

export const queryKeys = {
  // Auth related keys
  auth: {
    session: ["session"] as const,
    user: ["user"] as const,
  },

  // Request related keys (admin)
  requests: {
    all: ["requests"] as const,
    list: (filters?: Record<string, unknown>) => ["requests", "list", filters] as const,
    detail: (id: string) => ["requests", id] as const,
  },

  // Customer related keys (admin)
  customers: {
    all: ["customers"] as const,
    search: (query: string) => ["customers", "search", query] as const,
    detail: (id: string) => ["customers", id] as const,
  },

  // Chat related keys (admin)
  chats: {
    all: ["chats"] as const,
    list: ["chats", "list"] as const,
    detail: (id: string) => ["chats", id] as const,
    messages: (chatId: string) => ["chats", chatId, "messages"] as const,
  },

  // Application related keys
  applications: {
    list: ["applications"] as const,
    detail: (id: string) => ["applications", id] as const,
    steps: (id: string) => ["applications", id, "steps"] as const,
  },

  // Service related keys
  services: {
    list: ["services"] as const,
    byCountry: (countryCode: string) => ["services", "country", countryCode] as const,
    detail: (id: string) => ["services", id] as const,
  },

  // Country related keys
  countries: {
    list: ["countries"] as const,
  },

  // Visa Type related keys
  visaTypes: {
    list: ["visaTypes"] as const,
  },

  // Payment related keys
  payments: {
    all: ["payments"] as const,
    list: (filters?: Record<string, unknown>) => ["payments", "list", filters] as const,
    detail: (id: string) => ["payments", id] as const,
  },

  // Order related keys
  orders: {
    all: ["orders"] as const,
    list: (filters?: Record<string, unknown>) => ["orders", "list", filters] as const,
    detail: (id: string) => ["orders", id] as const,
  },

  // Quote related keys (admin)
  quotes: {
    all: ["quotes"] as const,
    detail: (id: string) => ["quotes", id] as const,
    byRequest: (requestId: string) => ["quotes", "request", requestId] as const,
  },

  // Notification related keys
  notifications: {
    all: ["notifications"] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },

  // Dashboard related keys
  dashboard: {
    stats: (range: string) => ["dashboard", "stats", range] as const,
  },
} as const;

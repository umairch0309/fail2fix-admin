"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Notification from "@/public/icons/notification";
import { useWebSocketStore } from "@/stores/websocket-store";
import { useNotifications, useUnreadNotificationCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import type { NotificationPayload, NotificationType } from "@/types/websocket";
import {
  Package,
  FileText,
  CreditCard,
  MessageSquare,
  Bell,
  CheckCheck,
  ClipboardList,
  X,
} from "lucide-react";

type TabType = "all" | "unread" | "read";

const notificationIconConfig: Record<NotificationType, { icon: typeof Package; color: string; bg: string }> = {
  order_created: { icon: Package, color: "text-green-600", bg: "bg-green-50" },
  order_updated: { icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
  order_status_changed: { icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
  quote_received: { icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
  quote_accepted: { icon: FileText, color: "text-green-600", bg: "bg-green-50" },
  quote_rejected: { icon: FileText, color: "text-red-600", bg: "bg-red-50" },
  payment_received: { icon: CreditCard, color: "text-green-600", bg: "bg-green-50" },
  payment_failed: { icon: CreditCard, color: "text-red-600", bg: "bg-red-50" },
  message_received: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
  request_created: { icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
  request_updated: { icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-50" },
  general: { icon: Bell, color: "text-gray-600", bg: "bg-gray-50" },
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: NotificationPayload;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    // Navigate based on notification data
    if (notification.data?.orderId) {
      window.location.href = `/orders/${notification.data.orderId}`;
    } else if (notification.data?.requestId) {
      window.location.href = `/requests`;
    } else if (notification.data?.quoteId) {
      window.location.href = `/quotes/${notification.data.quoteId}`;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const config = notificationIconConfig[notification.type] || notificationIconConfig.general;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl border cursor-pointer transition-all group",
        !notification.read
          ? "bg-[#FFF8F5] border-[#FFE4D2] hover:border-[#ff8c32]/30"
          : "bg-white border-[#EAEAEA] hover:border-[#D1D5DB]"
      )}
      onClick={handleClick}
    >
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm font-medium leading-tight",
            !notification.read ? "text-[#1F2937]" : "text-[#494F57]"
          )}>
            {notification.title}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-[#ff8c32]" />
            )}
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
            >
              <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
        <p className="text-sm text-[#6B7280] mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-[#9CA3AF] mt-1.5">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export function NotificationSheet() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Real-time notifications from WebSocket store
  const wsNotifications = useWebSocketStore((state) => state.notifications);
  const wsUnreadCount = useWebSocketStore((state) => state.unreadNotificationCount);

  // Fetched notifications and unread count from API
  const { data: apiNotifications = [] } = useNotifications();
  const { data: apiUnreadCount = 0 } = useUnreadNotificationCount();

  // Merge and dedupe notifications
  const allNotifications = useMemo(() => {
    const wsIds = new Set(wsNotifications.map((n) => n.id));
    const merged = [...wsNotifications];
    for (const n of apiNotifications) {
      if (!wsIds.has(n.id)) {
        merged.push(n);
      }
    }
    // Sort by createdAt descending
    return merged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [wsNotifications, apiNotifications]);

  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const unreadNotifications = useMemo(() => allNotifications.filter((n) => !n.read), [allNotifications]);
  const readNotifications = useMemo(() => allNotifications.filter((n) => n.read), [allNotifications]);

  // Use the higher of local or API unread count
  const unreadCount = useMemo(() => {
    const localCount = unreadNotifications.length;
    return Math.max(localCount, apiUnreadCount, wsUnreadCount);
  }, [unreadNotifications, apiUnreadCount, wsUnreadCount]);

  const displayedNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return unreadNotifications;
      case "read":
        return readNotifications;
      default:
        return allNotifications;
    }
  }, [activeTab, allNotifications, unreadNotifications, readNotifications]);

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread", count: unreadNotifications.length },
    { key: "read", label: "Read" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative flex items-center p-2 hover:bg-[#EAEAEA] rounded-lg transition-colors cursor-pointer">
          <Notification indicatorColor={unreadCount > 0 ? "#ff8c32" : "transparent"} />
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-lg font-semibold text-[#1F2937]">Notifications</SheetTitle>
        </SheetHeader>

        {/* Tabs */}
        <div className="px-6 pb-4 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-1 p-1 bg-[#F3F4F6] rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all",
                  activeTab === tab.key
                    ? "bg-white text-[#1F2937] shadow-sm"
                    : "text-[#6B7280] hover:text-[#1F2937]"
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-xs rounded-full",
                    activeTab === tab.key
                      ? "bg-[#ff8c32] text-white"
                      : "bg-[#E5E7EB] text-[#6B7280]"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-4">
            {displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-[#9CA3AF]" />
                </div>
                <p className="text-sm font-medium text-[#6B7280]">
                  {activeTab === "unread" ? "No unread notifications" :
                   activeTab === "read" ? "No read notifications" :
                   "No notifications yet"}
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  {activeTab === "all" && "We'll notify you about important updates"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Fixed Bottom - Mark all as read */}
        {unreadCount > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-[#EAEAEA] bg-white">
            <button
              onClick={() => markAllAsRead()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#ff8c32] bg-[#FFF8F5] hover:bg-[#FFEDE5] border border-[#FFE4D2] rounded-lg transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

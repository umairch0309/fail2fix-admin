"use client";

import { Calendar, AlertTriangle, User, Info, AlertOctagon } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import type { Order } from "@/types/order";
import { orderStatusConfig } from "@/types/order";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const config = orderStatusConfig[order.status];
  const total = parseFloat(order.quoteTotal);

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="bg-white rounded-lg border border-[#E4E7EE] border-l-[3px] border-l-[#14213d] overflow-hidden hover:border-[#ff8c32] hover:border-l-[#14213d] hover:shadow-md transition-all cursor-pointer">
        {/* Top section */}
        <div className="p-4 pb-3.5">
          {/* Title and Status */}
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-lg font-semibold text-[#14213d]">
              {order.quoteTitle || "Untitled Order"}
            </h3>
            <div
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border"
              style={{
                backgroundColor: config.bgColor,
                color: config.textColor,
                borderColor: config.borderColor,
              }}
            >
              {config.label}
            </div>
          </div>

          {/* Date, Order Number, Amount */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-[#81868C] font-medium">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(order.createdAt), "dd/MM/yyyy")}</span>
            </div>
            <span className="text-[#81868C] font-medium">
              #{order.orderNumber}
            </span>
            <span className="text-[#14213d] font-semibold">
              £ {total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#EAEAEA]" />

        {/* Bottom section */}
        <div className="px-4 py-2.5 flex items-center justify-between bg-[#FAFAFA]">
          {/* Customer & Assignee info */}
          <div className="flex items-center gap-3">
            {/* Customer */}
            <div className="flex items-center gap-2">
              <UserAvatar
                id={order.customerId}
                name={order.customerName || "Customer"}
                size="md"
              />
              <span className="text-sm font-medium text-[#494F57]">
                {order.customerName || "Unknown Customer"}
              </span>
            </div>

            <span className="text-[#D1D5DB]">•</span>

            {/* Assignee */}
            {order.assigneeName && (
              <>
                <div className="flex items-center gap-1.5 text-sm text-[#81868C]">
                  <User className="h-3.5 w-3.5" />
                  <span>{order.assigneeName}</span>
                </div>
                <span className="text-[#D1D5DB]">•</span>
              </>
            )}

            {/* Updated time */}
            <span className="text-sm font-medium text-[#81868C]">
              Updated{" "}
              {formatDistanceToNow(new Date(order.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Latest Update if exists */}
          {order.latestUpdate && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
              order.latestUpdate.type === "critical"
                ? "border-red-200 bg-red-50"
                : order.latestUpdate.type === "warning"
                ? "border-amber-200 bg-amber-50"
                : "border-blue-200 bg-blue-50"
            }`}>
              {order.latestUpdate.type === "critical" ? (
                <AlertOctagon className="h-4 w-4 text-red-600 flex-shrink-0" />
              ) : order.latestUpdate.type === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              ) : (
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
              )}
              <span className={`text-sm truncate max-w-[200px] ${
                order.latestUpdate.type === "critical"
                  ? "text-red-700"
                  : order.latestUpdate.type === "warning"
                  ? "text-amber-700"
                  : "text-blue-700"
              }`}>
                {order.latestUpdate.content}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserAvatar } from "@/components/user-avatar";
import type { Request, RequestStatus } from "@/types/request";
import { requestStatusConfig } from "@/types/request";
import { RequestActions } from "./request-actions";

// Re-export Request type for convenience
export type { Request } from "@/types/request";

// Base columns without actions (shared between both versions)
const baseColumns: ColumnDef<Request>[] = [
  {
    accessorKey: "customerName",
    header: () => <span className="pl-2">Customer Name</span>,
    cell: ({ row }) => {
      const name = row.getValue("customerName") as string;
      const id = row.original.id;
      return (
        <div className="flex items-center gap-2 pl-2">
          <UserAvatar id={id} name={name} size="md" />
          <span className="font-medium text-[#494F57]">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "vrm",
    header: "VRM",
    cell: ({ row }) => (
      <span className="text-[#97999D]">{row.getValue("vrm")}</span>
    ),
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
    cell: ({ row }) => (
      <span className="text-[#97999D]">{row.getValue("postcode")}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Requested",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      const formatted = new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return <span className="text-[#97999D]">{formatted}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as RequestStatus;
      const config = requestStatusConfig[status];
      if (!config) {
        return <span className="text-[#97999D]">{status}</span>;
      }
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border"
          style={{
            backgroundColor: config.bgColor,
            color: config.textColor,
            borderColor: config.borderColor,
          }}
        >
          <span
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: config.statusColor }}
          />
          {config.label}
        </div>
      );
    },
  },
];

// Link-based columns for requests page (uses parallel routes)
export const columns: ColumnDef<Request>[] = [
  ...baseColumns,
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const request = row.original;
      return <RequestActions request={request} />;
    },
  },
];

// Callback-based columns for dashboard/chat (opens sheet directly)
export const createColumns = (
  onViewDetails: (requestId: string) => void,
  onCreateQuote?: (requestId: string) => void
): ColumnDef<Request>[] => [
  ...baseColumns,
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const request = row.original;
      return (
        <RequestActions
          request={request}
          onViewDetails={onViewDetails}
          onCreateQuote={onCreateQuote}
        />
      );
    },
  },
];


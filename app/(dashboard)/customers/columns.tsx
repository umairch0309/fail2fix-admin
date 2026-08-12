"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { CustomerDetailsSheet } from "@/components/customer-details-sheet";
import type { Customer } from "@/types/customer";

const statusConfig = {
  active: {
    label: "Active",
    textColor: "#395214",
    borderColor: "#B3EC3D",
    bgColor: "#FBFFF4",
  },
  banned: {
    label: "Banned",
    textColor: "#DC2626",
    borderColor: "#FECACA",
    bgColor: "#FEF2F2",
  },
};

function CustomerActions({ customer }: { customer: Customer }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-[#494F57] border-[#EAEAEA] shadow-none"
          onClick={() => setSheetOpen(true)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </div>
      <CustomerDetailsSheet
        customer={customer}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: () => <span className="pl-2">Customer Name</span>,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-[#97999D]">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-[#97999D]">{row.original.phone || "-"}</span>
    ),
  },
  {
    accessorKey: "emailVerified",
    header: "Verified",
    cell: ({ row }) => {
      const verified = row.original.emailVerified;
      return (
        <span className={verified ? "text-green-600" : "text-[#97999D]"}>
          {verified ? "Yes" : "No"}
        </span>
      );
    },
  },
  {
    accessorKey: "banned",
    header: "Status",
    cell: ({ row }) => {
      const isBanned = row.original.banned === true;
      const status = isBanned ? "banned" : "active";
      const config = statusConfig[status];
      return (
        <div
          className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium border"
          style={{
            backgroundColor: config.bgColor,
            color: config.textColor,
            borderColor: config.borderColor,
          }}
        >
          {config.label}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">Action</div>,
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
];

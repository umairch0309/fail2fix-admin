"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Ban, UserCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserAvatar } from "@/components/user-avatar";
import { useBanCustomer, useUnbanCustomer, useDeleteCustomer } from "@/hooks/use-customers";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);

  const banCustomer = useBanCustomer();
  const unbanCustomer = useUnbanCustomer();
  const deleteCustomer = useDeleteCustomer();

  const isBanned = customer.banned === true;

  const handleBan = () => {
    banCustomer.mutate({ customerId: customer.id });
    setShowBanDialog(false);
  };

  const handleUnban = () => {
    unbanCustomer.mutate(customer.id);
  };

  const handleDelete = () => {
    deleteCustomer.mutate(customer.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-[#494F57] border-[#EAEAEA] shadow-none"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-[#97999D] border-[#EAEAEA] shadow-none"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isBanned ? (
              <DropdownMenuItem onClick={handleUnban} disabled={unbanCustomer.isPending}>
                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                <span>Unban Customer</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setShowBanDialog(true)}>
                <Ban className="h-4 w-4 mr-2 text-orange-600" />
                <span>Ban Customer</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              <span>Delete Customer</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban {customer.name}? They will not be able to access their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {banCustomer.isPending ? "Banning..." : "Ban Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {customer.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCustomer.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    accessorKey: "city",
    header: "Location",
    cell: ({ row }) => {
      const city = row.original.city;
      const state = row.original.state;
      const location = [city, state].filter(Boolean).join(", ") || "-";
      return <span className="text-[#97999D]">{location}</span>;
    },
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
    header: "Action",
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
];

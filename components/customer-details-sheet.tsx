"use client";

import { useEffect, useState } from "react";
import { Ban, UserCheck, Trash2, User, Mail, Phone, MapPin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import {
  useBanCustomer,
  useUnbanCustomer,
  useDeleteCustomer,
} from "@/hooks/use-customers";
import type { Customer } from "@/types/customer";

interface CustomerDetailsSheetProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsSheet({
  customer,
  open,
  onOpenChange,
}: CustomerDetailsSheetProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [current, setCurrent] = useState<Customer | null>(customer);

  const banCustomer = useBanCustomer();
  const unbanCustomer = useUnbanCustomer();
  const deleteCustomer = useDeleteCustomer();

  useEffect(() => {
    if (open) {
      setCurrent(customer);
    }
  }, [customer, open]);

  if (!current) return null;

  const isBanned = current.banned === true;
  const location =
    [current.city, current.state, current.postalCode]
      .filter(Boolean)
      .join(", ") || "—";

  const handleBan = (e: React.MouseEvent) => {
    e.preventDefault();
    banCustomer.mutate(
      { customerId: current.id },
      {
        onSuccess: (updated) => {
          setCurrent(updated);
          setShowBanDialog(false);
        },
      },
    );
  };

  const handleUnban = () => {
    unbanCustomer.mutate(current.id, {
      onSuccess: (updated) => {
        setCurrent(updated);
      },
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    deleteCustomer.mutate(current.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        onOpenChange(false);
      },
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 overflow-y-auto bg-[#F5F6F7]"
        >
          <SheetHeader className="px-6 py-4 border-b border-[#EDEDED] bg-white">
            <div className="flex items-center gap-3">
              <UserAvatar id={current.id} name={current.name} size="md" />
              <div>
                <SheetTitle className="text-base font-semibold text-[#1F2937]">
                  {current.name}
                </SheetTitle>
                <p className="text-xs text-[#7F7F7F]">Customer details</p>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-4">
            <div className="bg-white border border-[#EDEDED] rounded-xl divide-y divide-[#EDEDED]">
              <DetailRow
                icon={<Mail className="w-4 h-4 text-[#ff8c32]" />}
                label="Email"
                value={current.email}
              />
              <DetailRow
                icon={<Phone className="w-4 h-4 text-[#ff8c32]" />}
                label="Phone"
                value={current.phone || "—"}
              />
              <DetailRow
                icon={<MapPin className="w-4 h-4 text-[#ff8c32]" />}
                label="Location"
                value={location}
              />
              <DetailRow
                icon={<User className="w-4 h-4 text-[#ff8c32]" />}
                label="Verified"
                value={current.emailVerified ? "Yes" : "No"}
              />
              <DetailRow
                icon={<User className="w-4 h-4 text-[#ff8c32]" />}
                label="Status"
                value={isBanned ? "Banned" : "Active"}
              />
              {isBanned && current.banReason && (
                <DetailRow
                  icon={<Ban className="w-4 h-4 text-[#ff8c32]" />}
                  label="Ban reason"
                  value={current.banReason}
                />
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {isBanned ? (
                <Button
                  variant="outline"
                  className="w-full justify-center border-[#BBF7D0] text-[#166534] hover:bg-[#F0FDF4]"
                  onClick={handleUnban}
                  disabled={unbanCustomer.isPending || deleteCustomer.isPending}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {unbanCustomer.isPending ? "Unbanning..." : "Unban Customer"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-center border-[#FFE4D2] text-[#813500] hover:bg-[#FFF8F3]"
                  onClick={() => setShowBanDialog(true)}
                  disabled={banCustomer.isPending || deleteCustomer.isPending}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban Customer
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-center border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]"
                onClick={() => setShowDeleteDialog(true)}
                disabled={
                  banCustomer.isPending ||
                  unbanCustomer.isPending ||
                  deleteCustomer.isPending
                }
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Customer
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban {current.name}? They will not be able
              to access their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={banCustomer.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={banCustomer.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {banCustomer.isPending ? "Banning..." : "Ban Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {current.name}? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCustomer.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCustomer.isPending}
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

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-[#7F7F7F]">{label}</p>
        <p className="text-sm font-medium text-[#1F2937] break-words">{value}</p>
      </div>
    </div>
  );
}

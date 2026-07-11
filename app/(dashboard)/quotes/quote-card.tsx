"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
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
import { useDeleteQuote } from "@/hooks/use-quotes";
import type { QuoteListItem, QuoteStatus } from "@/types/quote";
import { quoteStatusConfig } from "@/types/quote";

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format amount for display
 */
function formatAmount(amount: string | null): string {
  if (!amount) return "£0.00";
  const num = parseFloat(amount);
  return `£ ${num.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface QuoteCardProps {
  quote: QuoteListItem;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteQuote = useDeleteQuote();

  const config = quoteStatusConfig[quote.status as QuoteStatus] || quoteStatusConfig.draft;
  const displayDate = quote.sentAt ? formatDate(quote.sentAt) : formatDate(quote.createdAt);

  // Only paid quotes cannot be deleted/edited
  const canModify = quote.status !== "paid";

  const handleCardClick = () => {
    router.push(`/quotes/${quote.id}`);
  };

  const handleView = () => {
    router.push(`/quotes/${quote.id}`);
  };

  const handleEdit = () => {
    router.push(`/quotes/${quote.id}/edit`);
  };

  const handleDelete = () => {
    deleteQuote.mutate(quote.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  return (
    <div
      className="relative w-[200px] h-[280px] cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Main card */}
      <div className="absolute inset-0 bg-white border border-[#E4E7EE] border-l-[3px] border-l-[#14213d] p-4 flex flex-col rounded-lg group-hover:border-[#ff8c32] group-hover:border-l-[#14213d] group-hover:shadow-md transition-all duration-200"></div>
      {/* White cover for top-right border - outside card to cover border */}
      <div className="absolute -top-[1px] -right-[1px] w-[36px] h-[36px] bg-white z-10" />
      {/* Folded corner effect - inward fold */}
      <div
        className="absolute top-0 right-0 z-20"
        style={{
          borderStyle: "solid",
          borderWidth: "0 32px 32px 0",
          borderColor: "#E8E8E8 white",
          borderBottomLeftRadius: "6px",
        }}
      />
      {/* Card content */}
      <div className="absolute inset-0 p-4 pb-3 flex flex-col z-30 pointer-events-none">
        <div className="pointer-events-auto flex flex-col h-full">
          {/* Invoice number */}
          <p className="text-xs text-[#81868C] mb-3">
            #{quote.invoiceNumber || "Draft"}
          </p>

          {/* Customer */}
          <div className="flex items-center gap-2">
            <UserAvatar
              id={quote.customerId}
              name={quote.customerName || "Unknown"}
              size="md"
            />
            <span className="text-sm font-medium text-[#14213d] truncate max-w-[130px]">
              {quote.customerName || "Unknown"}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Date and Amount */}
          <div>
            <p className="text-xs text-[#81868C] mb-1">{displayDate}</p>
            <p className="text-2xl font-semibold text-[#14213d] mb-4">
              {formatAmount(quote.total)}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border"
                style={{
                  backgroundColor: config.bgColor,
                  color: config.textColor,
                  borderColor: config.borderColor,
                }}
              >
                {config.label}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-[#97999D] hover:text-[#494F57] border-[#EAEAEA] shadow-none"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={handleView}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  {canModify && (
                    <>
                      <DropdownMenuItem onClick={handleEdit}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete quote #{quote.invoiceNumber || "Draft"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteQuote.isPending}
            >
              {deleteQuote.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

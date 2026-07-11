"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
import Quotes from "@/public/icons/Quotes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteRequest } from "@/hooks/use-requests";
import type { Request } from "@/types/request";
import Link from "next/link";

interface RequestActionsProps {
  request: Request;
  onViewDetails?: (requestId: string) => void;
  onCreateQuote?: (requestId: string) => void;
}

export function RequestActions({ request, onViewDetails, onCreateQuote }: RequestActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteRequest();

  const handleDelete = () => {
    deleteRequest(request.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {onViewDetails ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-[#494F57] border-[#EAEAEA]"
            onClick={() => onViewDetails(request.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-[#494F57] border-[#EAEAEA]"
            asChild
          >
            <Link href={`/requests/details/${request.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#97999D]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onCreateQuote?.(request.id)}
              className="cursor-pointer"
            >
              <Quotes className="h-4 w-4 mr-2" />
              Create Quote
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this request for {request.vrm}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

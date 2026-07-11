"use client";

import { useRouter, useParams } from "next/navigation";
import { useCallback } from "react";
import QuoteDetailsSheet from "@/components/dashboard/quote-details-sheet";

export default function RequestDetailsModal() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  const handleCreateQuote = useCallback((reqId: string) => {
    router.push(`/quotes/new/create?requestId=${reqId}`);
  }, [router]);

  return (
    <QuoteDetailsSheet
      requestId={requestId}
      open={true}
      onOpenChange={handleOpenChange}
      onCreateQuote={handleCreateQuote}
    />
  );
}

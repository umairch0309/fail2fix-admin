"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/custombutton";
import { useRequest } from "@/hooks/use-requests";
import { requestStatusConfig } from "@/types/request";
import { Copy, Check, Car, Wrench } from "lucide-react";
import Orders from "@/public/icons/Orders";
import { FilePreviewModal, FileThumbnail } from "@/components/ui/file-preview-modal";
import Quotes from "@/public/icons/Quotes";
import { toast } from "@/components/ui/sonner";

interface QuoteDetailsSheetProps {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateQuote?: (requestId: string) => void;
}

const QuoteDetailsSheet: React.FC<QuoteDetailsSheetProps> = ({
  requestId,
  open,
  onOpenChange,
  onCreateQuote,
}) => {
  const router = useRouter();
  const { data: request, isLoading } = useRequest(requestId || undefined);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const CopyButton = ({ value, field }: { value: string; field: string }) => (
    <button
      onClick={() => handleCopy(value, field)}
      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-[#9CA3AF]" />
      )}
    </button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col bg-[#F5F6F7]">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-[#EDEDED] bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF4ED] flex items-center justify-center">
              <Car className="w-5 h-5 text-[#ff8c32]" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold text-[#1F2937]">
                Quote Details
              </SheetTitle>
              {request && (
                <p className="text-sm text-[#7F7F7F]">
                  {new Date(request.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="p-6 flex items-center justify-center min-h-[200px] flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff8c32]" />
          </div>
        ) : request ? (
          <>
            {/* Scrollable Content */}
            <div className="px-6 pt-4 pb-6 space-y-5 flex-1 overflow-y-auto">
              {/* Status Badge - Prominent at top */}
              <div className="flex items-center justify-between bg-white border border-[#EDEDED] rounded-lg px-4 h-14">
                <span className="text-sm font-medium text-[#7F7F7F]">Status</span>
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    color: requestStatusConfig[request.status].textColor,
                    backgroundColor: requestStatusConfig[request.status].bgColor,
                    border: `1px solid ${requestStatusConfig[request.status].borderColor}`,
                  }}
                >
                  {requestStatusConfig[request.status].label}
                </span>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wider">
                  Contact Information
                </h3>
                <div className="bg-white border border-[#EDEDED] rounded-lg divide-y divide-[#EDEDED]">
                  {/* Name */}
                  <div className="flex items-center justify-between px-4 h-12">
                    <span className="text-sm text-[#7F7F7F]">Name</span>
                    <span className="text-sm font-medium text-[#1F2937]">
                      {request.name}
                    </span>
                  </div>
                  {/* Email */}
                  <div className="flex items-center justify-between px-4 h-12">
                    <span className="text-sm text-[#7F7F7F]">Email</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#1F2937]">
                        {request.email}
                      </span>
                      <CopyButton value={request.email} field="email" />
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="flex items-center justify-between px-4 h-12">
                    <span className="text-sm text-[#7F7F7F]">Phone</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#1F2937]">
                        {request.phone}
                      </span>
                      <CopyButton value={request.phone} field="phone" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wider">
                  Vehicle Information
                </h3>
                <div className="bg-white border border-[#EDEDED] rounded-lg divide-y divide-[#EDEDED]">
                  {/* VRM */}
                  <div className="flex items-center justify-between px-4 h-12">
                    <span className="text-sm text-[#7F7F7F]">VRM</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#1F2937]">
                        {request.vrm}
                      </span>
                      <CopyButton value={request.vrm} field="vrm" />
                    </div>
                  </div>
                  {/* Postcode */}
                  <div className="flex items-center justify-between px-4 h-12">
                    <span className="text-sm text-[#7F7F7F]">Postcode</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#1F2937]">
                        {request.postcode}
                      </span>
                      <CopyButton value={request.postcode} field="postcode" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wider">
                  Description
                </h3>
                <div className="bg-white border border-[#EDEDED] rounded-lg px-4 py-3 min-h-[80px]">
                  <p className="text-sm text-[#1F2937]">
                    {request.notes || (
                      <span className="text-[#9CA3AF] italic">No description provided</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Selected Repairs Section */}
              {request.quote && request.quote.items && request.quote.items.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-[#F97316]" />
                    Selected Repairs ({request.quote.items.length})
                  </h3>
                  <div className="bg-white border border-[#EDEDED] rounded-lg divide-y divide-[#EDEDED]">
                    {request.quote.items.map((item) => (
                      <div key={item.id} className="px-4 py-3">
                        <p className="text-sm font-medium text-[#1F2937]">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MOT Details Upload */}
              {request.motDetailsUrl && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wider">
                    MOT Failure Details
                  </h3>
                  <div className="bg-white border border-[#EDEDED] rounded-xl p-4">
                    <div className="flex flex-wrap gap-3">
                      <FileThumbnail
                        url={request.motDetailsUrl}
                        onClick={() => handlePreview(request.motDetailsUrl!)}
                      />
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-3">
                      Click to preview or download
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer - Action Buttons */}
            {(request.status === "quote_requested" || request.orderId) && (
              <div className="p-6 border-t border-[#EDEDED] bg-white flex-shrink-0">
                {request.status === "quote_requested" ? (
                  <Button
                    onClick={() => {
                      if (requestId) {
                        onCreateQuote?.(requestId);
                      }
                    }}
                    fullWidth
                    size="md"
                  >
                    <Quotes className="w-5 h-5" color="white" />
                    Create Quote
                  </Button>
                ) : request.orderId ? (
                  <Button
                    onClick={() => {
                      router.push(`/orders/${request.orderId}`);
                      onOpenChange(false);
                    }}
                    fullWidth
                    size="md"
                  >
                    <Orders className="w-5 h-5" color="white" />
                    View Order
                  </Button>
                ) : null}
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-[#7F7F7F] min-h-[200px] flex items-center justify-center flex-1">
            Request not found
          </div>
        )}

        {/* File Preview Modal */}
        <FilePreviewModal
          url={previewUrl}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      </SheetContent>
    </Sheet>
  );
};

export default QuoteDetailsSheet;

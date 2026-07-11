"use client";

import { useParams, useRouter } from "next/navigation";
import { useRequest } from "@/hooks/use-requests";
import { requestStatusConfig } from "@/types/request";
import { Copy, Check, FileText, Image as ImageIcon, ArrowLeft, Phone, Mail, MapPin, Car, Calendar, ExternalLink, Wrench } from "lucide-react";
import Orders from "@/public/icons/Orders";
import { toast } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";
import CustomButton from "@/components/custombutton";

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const setHeader = useDashboardStore((state) => state.setHeader);

  const { data: request, isLoading } = useRequest(requestId);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setHeader({
      title: "Requests",
      description: "",
      showBreadcrumbs: true,
      breadcrumbs: [
        { label: "Requests", href: "/requests" },
        { label: request?.vrm || "Loading..." },
      ],
      showButton: false,
    });
  }, [setHeader, request?.vrm]);

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success("Copied to clipboard", { sound: false });
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

  const getFileType = (url: string): "pdf" | "image" | "unknown" => {
    const lowercaseUrl = url.toLowerCase();
    if (lowercaseUrl.includes(".pdf")) return "pdf";
    if (
      lowercaseUrl.includes(".png") ||
      lowercaseUrl.includes(".jpg") ||
      lowercaseUrl.includes(".jpeg") ||
      lowercaseUrl.includes(".webp")
    )
      return "image";
    return "unknown";
  };

  const getFileName = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      const filename = pathname.split("/").pop() || "MOT Details";
      return filename.length > 20 ? filename.slice(0, 17) + "..." : filename;
    } catch {
      return "MOT Details";
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-[#F8F8F8] border-t border-[#EBEBEB] overflow-auto">
        <div className="max-w-4xl mx-auto px-3 md:px-5 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="h-full bg-[#F8F8F8] border-t border-[#EBEBEB] flex flex-col items-center justify-center min-h-[400px] text-[#7F7F7F]">
        <p>Request not found</p>
        <button
          onClick={() => router.push("/requests")}
          className="mt-4 text-[#ff8c32] hover:underline"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const statusConfig = requestStatusConfig[request.status];
  const canCreateQuote = request.status === "quote_requested";

  return (
    <div className="h-full bg-[#F8F8F8] border-t border-[#EBEBEB] overflow-auto">
      <div className="max-w-4xl mx-auto px-3 md:px-5 py-6">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/requests")}
            className="flex items-center gap-2 text-[#494F57] hover:text-[#1F2937] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-semibold">{request.vrm}</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border"
              style={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.textColor,
                borderColor: statusConfig.borderColor,
              }}
            >
              <span
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: statusConfig.statusColor }}
              />
              {statusConfig.label}
            </div>

            {/* Create Quote Button */}
            {canCreateQuote && (
              <CustomButton
                onClick={() => router.push(`/quotes/new/create?requestId=${request.id}`)}
              >
                Create Quote
              </CustomButton>
            )}

            {/* View Order Button */}
            {request.orderId && (
              <CustomButton
                onClick={() => router.push(`/orders/${request.orderId}`)}
              >
                <Orders className="w-4 h-4" color="white" />
                View Order
              </CustomButton>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer Details Card */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h2 className="text-base font-semibold text-[#1F2937] mb-4">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Name</p>
                <p className="text-sm font-medium text-[#1F2937]">{request.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#9CA3AF]" />
                  <p className="text-sm font-medium text-[#1F2937]">{request.email}</p>
                  <CopyButton value={request.email} field="email" />
                </div>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Phone Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#9CA3AF]" />
                  <p className="text-sm font-medium text-[#1F2937]">{request.phone}</p>
                  <CopyButton value={request.phone} field="phone" />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle & Request Info Card */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h2 className="text-base font-semibold text-[#1F2937] mb-4">Vehicle & Request Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Vehicle Registration</p>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#9CA3AF]" />
                  <p className="text-sm font-semibold text-[#1F2937] tracking-wide">{request.vrm}</p>
                  <CopyButton value={request.vrm} field="vrm" />
                </div>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Postcode</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9CA3AF]" />
                  <p className="text-sm font-medium text-[#1F2937]">{request.postcode}</p>
                  <CopyButton value={request.postcode} field="postcode" />
                </div>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Request Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                  <p className="text-sm font-medium text-[#1F2937]">
                    {format(new Date(request.createdAt), "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h2 className="text-base font-semibold text-[#1F2937] mb-3">Notes / Description</h2>
            <p className="text-sm text-[#494F57] leading-relaxed">
              {request.notes || (
                <span className="text-[#9CA3AF] italic">No description provided</span>
              )}
            </p>
          </div>

          {/* Selected Repairs Card */}
          {request.quote && request.quote.items && request.quote.items.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#1F2937] flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#F97316]" />
                  Selected Repairs ({request.quote.items.length})
                </h2>
                <Link
                  href={`/quotes/${request.quote.id}`}
                  className="text-sm text-[#ff8c32] hover:underline flex items-center gap-1"
                >
                  View Quote
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {request.quote.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                  >
                    <p className="text-sm font-medium text-[#1F2937]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MOT Details Upload Card */}
          {request.motDetailsUrl && (
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
              <h2 className="text-base font-semibold text-[#1F2937] mb-4">MOT Details</h2>
              <a
                href={request.motDetailsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 p-4 bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl hover:bg-[#F3F4F6] transition-colors group"
              >
                <div className="w-12 h-12 bg-white border border-[#E0E0E0] rounded-lg flex items-center justify-center">
                  {getFileType(request.motDetailsUrl) === "pdf" ? (
                    <FileText className="w-6 h-6 text-[#EF4444]" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[#3B82F6]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1F2937]">
                    {getFileName(request.motDetailsUrl)}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {getFileType(request.motDetailsUrl) === "pdf" ? "PDF Document" : "Image File"}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#6B7280]" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

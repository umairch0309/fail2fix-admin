import React from "react";
import { cn } from "@/lib/utils";
import { requestStatusConfig } from "@/types/request";
import type { QuoteRequestPayload } from "@/types/websocket";
import { Car, MapPin, User, FileText } from "lucide-react";

interface QuoteRequestCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quoteRequest: QuoteRequestPayload;
  time?: string;
  showTime?: boolean;
  isGrouped?: boolean;
  onViewDetails?: (requestId: string) => void;
}

const QuoteRequestCard: React.FC<QuoteRequestCardProps> = ({
  quoteRequest,
  time,
  showTime = true,
  isGrouped = false,
  onViewDetails,
  className,
  ...props
}) => {
  const statusConfig = requestStatusConfig[quoteRequest.status];

  return (
    <div className="flex justify-start">
      <div className={cn("flex flex-col text-[0.9rem]", showTime ? "gap-1" : "gap-0")}>
        <div
          className={cn(
            "p-5 rounded-2xl w-[320px] md:w-[380px] bg-white border border-[#EAEAEA] font-sans",
            className
          )}
          {...props}
        >
          <div className="flex flex-col gap-4">
            {/* Header with icon and status badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#FFF4ED] flex items-center justify-center">
                  <Car className="w-5 h-5 text-[#ff8c32]" />
                </div>
                <div className="text-base font-semibold text-[#1F2937]">
                  Quote Request
                </div>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  color: statusConfig.textColor,
                  backgroundColor: statusConfig.bgColor,
                  border: `1px solid ${statusConfig.borderColor}`,
                }}
              >
                {statusConfig.label}
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#6B7280]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-[#6B7280]">Name</span>
                  <span className="text-sm font-medium text-[#1F2937]">{quoteRequest.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                  <Car className="w-4 h-4 text-[#6B7280]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-[#6B7280]">Vehicle Registration</span>
                  <span className="text-sm font-semibold text-[#1F2937] tracking-wide">{quoteRequest.vrm}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#6B7280]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-[#6B7280]">Postcode</span>
                  <span className="text-sm font-medium text-[#1F2937]">{quoteRequest.postcode}</span>
                </div>
              </div>

              {quoteRequest.notes && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-[#6B7280]">Notes</span>
                    <span className="text-sm text-[#4B5563]">{quoteRequest.notes}</span>
                  </div>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <button
              onClick={() => onViewDetails?.(quoteRequest.requestId)}
              className="mt-2 flex items-center justify-center w-full py-2.5 bg-[#ff8c32] hover:bg-[#e06f12] text-white text-sm font-medium rounded-xl transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
        {showTime && time && (
          <div className="px-2 text-[#9CA3AF] text-xs w-full flex justify-start">
            <div>{time}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteRequestCard;

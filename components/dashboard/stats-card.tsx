"use client";

import { motion } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedNumber } from "./animated-number";
import type { DateRange } from "@/types/dashboard";

interface StatItem {
  label: string;
  value: string | number;
}

interface StatsCardProps {
  title: string;
  mainValue: string | number;
  mainLabel: string;
  secondaryTitle?: string;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  stats?: StatItem[];
  filterValue?: DateRange;
  onFilterChange?: (value: DateRange) => void;
  isLoading?: boolean;
}

function BigValue({
  value,
  isLoading,
  className = "",
}: {
  value: string | number;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight ${
        isLoading ? "animate-pulse" : ""
      } ${className}`}
    >
      {isLoading ? (
        "..."
      ) : typeof value === "number" ? (
        <AnimatedNumber value={value} />
      ) : (
        value
      )}
    </p>
  );
}

export function StatsCard({
  title,
  mainValue,
  mainLabel,
  secondaryTitle,
  secondaryValue,
  secondaryLabel,
  stats,
  filterValue = "7days",
  onFilterChange,
  isLoading,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="grid grid-rows-[1fr_auto] rounded-lg border border-[#E4E7EE] overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Top Section — navy panel from the logo */}
      <div className="flex flex-col md:flex-row bg-[#14213d]">
        {/* Main Stat */}
        <div className="flex-1 p-3 md:p-6 border-b md:border-b-0 md:border-r border-white/10">
          <div className="flex items-center gap-2 mb-2 md:mb-4">
            <span className="w-1.5 h-4 rounded-sm bg-[#ff8c32]" />
            <p className="text-sm font-medium text-white/80">{title}</p>
          </div>
          <BigValue value={mainValue} isLoading={isLoading} className="text-white" />
          <p className="text-sm font-medium text-white/50 mt-2">{mainLabel}</p>
        </div>

        {/* Secondary Stat */}
        {secondaryTitle && (
          <div className="flex-1 p-3 md:p-6 lg:p-3 xl:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-sm bg-[#ff8c32]" />
                <p className="text-sm font-medium text-white/80">{secondaryTitle}</p>
              </div>
              {/* Filter Select */}
              <Select value={filterValue} onValueChange={(v) => onFilterChange?.(v as DateRange)}>
                <SelectTrigger className="bg-white/10 rounded-md border border-white/20 text-sm text-white h-8 px-3 w-auto [&_svg]:text-white/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p
              className={`text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-[#ff8c32] ${
                isLoading ? "animate-pulse" : ""
              }`}
            >
              <span className="text-white/40">£</span> {isLoading ? "..." : secondaryValue}
            </p>
            <p className="text-sm font-medium text-white/50 mt-2">{secondaryLabel}</p>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-[#E4E7EE] bg-white">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex-1 p-3 md:p-6 border-b sm:border-b-0 last:border-b-0 sm:border-r sm:last:border-r-0 border-[#E4E7EE]"
            >
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">
                {stat.label}
              </p>
              <p
                className={`text-xl md:text-2xl font-semibold text-[#14213d] ${
                  isLoading ? "animate-pulse" : ""
                }`}
              >
                {isLoading ? (
                  "..."
                ) : typeof stat.value === "number" ? (
                  <AnimatedNumber value={stat.value} />
                ) : (
                  stat.value
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

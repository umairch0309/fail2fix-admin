"use client";

import { motion } from "motion/react";

interface ResponseTimeCardProps {
  title: string;
  value: string;
  isLoading?: boolean;
}

export function ResponseTimeCard({
  title,
  value,
  isLoading,
}: ResponseTimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      whileHover={{ y: -2 }}
      className="bg-[#14213d] rounded-lg border border-[#14213d] pt-4 pr-4 pb-6 pl-6 relative h-full shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-sm bg-[#ff8c32]" />
          <p className="text-sm font-medium text-white/80">{title}</p>
        </div>
      </div>
      <p
        className={`text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight text-white ${
          isLoading ? "animate-pulse" : ""
        }`}
      >
        {isLoading ? "..." : value}
      </p>
    </motion.div>
  );
}

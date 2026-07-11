"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface ListEmptyStateProps {
  icon: LucideIcon;
  badgeIcon?: LucideIcon;
  title: string;
  description: string;
  footer?: React.ReactNode;
  action?: React.ReactNode;
}

export function ListEmptyState({
  icon: Icon,
  badgeIcon: BadgeIcon,
  title,
  description,
  footer,
  action,
}: ListEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#E8EEF7] to-[#C5D5EB] flex items-center justify-center border border-[#14213d]/10">
          <Icon className="w-10 h-10 text-[#14213d]" strokeWidth={1.5} />
        </div>
        {BadgeIcon && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-[#C5D5EB] flex items-center justify-center shadow-sm"
          >
            <BadgeIcon className="w-4 h-4 text-[#14213d]" />
          </motion.div>
        )}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-lg font-semibold text-[#14213d] mb-2"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[#6b7280] text-sm max-w-xs"
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          {action}
        </motion.div>
      )}

      {footer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          {footer}
        </motion.div>
      )}
    </motion.div>
  );
}

interface TableEmptyStateProps {
  title?: string;
  description?: string;
}

export function TableEmptyState({
  title = "No results found",
  description = "We couldn't find any data to display. Try adjusting your filters or create a new entry.",
}: TableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#E8EEF7] to-[#C5D5EB] flex items-center justify-center mb-4 border border-[#14213d]/10">
        <svg
          className="w-10 h-10 text-[#14213d]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M13 2v7h7" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#14213d] mb-1">{title}</h3>
      <p className="text-sm text-[#6b7280] max-w-[280px]">{description}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Plus, FileText, Users } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const router = useRouter();
  const {
    pageTitle,
    pageDescription,
    breadcrumbs,
    showBreadcrumbs,
    headerButton,
    showHeaderButton,
    setNewCustomerSheetOpen,
  } = useDashboardStore();

  const createOptions = [
    {
      label: "New Quote",
      onClick: () => router.push("/quotes/new"),
      icon: FileText,
    },
    {
      label: "New Customer",
      onClick: () => setNewCustomerSheetOpen(true),
      icon: Users,
    },
  ];

  // Don't render if nothing to show
  const hasBreadcrumbs = showBreadcrumbs && breadcrumbs.length > 0;
  if (!pageTitle && !hasBreadcrumbs && !showHeaderButton) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-3 md:px-5 md:py-4">
      <div>
        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-[#81868C] mb-1">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#14213d]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#14213d]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {pageTitle && (
          <h1 className="text-base md:text-lg font-semibold text-[#14213d]">{pageTitle}</h1>
        )}
        {pageDescription && (
          <p className="text-xs md:text-sm text-[#97999D] tracking-[-0.1px] font-medium">{pageDescription}</p>
        )}
      </div>

      {showHeaderButton && headerButton && (
        <ButtonGroup className="rounded-full overflow-hidden gap-0 shadow-[inset_0_0_0_2px_#ff8c32] self-start sm:self-auto">
          <Button
            onClick={headerButton.onClick}
            className="bg-[#ff8c32] hover:bg-[#e06f12] text-white rounded-none rounded-l-full px-2 py-2 md:py-2.5 gap-1 text-sm"
          >
            <Plus className="h-4 w-4" />
            {headerButton.label}
          </Button>
          <ButtonGroupSeparator className="bg-[#ff8c32]" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="bg-[#ff8c32] hover:bg-[#e06f12] text-white rounded-none rounded-r-full px-1.5 py-2 md:py-2.5 h-auto"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {createOptions.map((option) => (
                <DropdownMenuItem
                  key={option.label}
                  onClick={option.onClick}
                  className="cursor-pointer"
                >
                  <option.icon className="h-4 w-4 mr-2 text-[#97999D]" />
                  <span>{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      )}
    </div>
  );
}

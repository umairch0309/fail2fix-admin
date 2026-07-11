"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const linkMap: Record<string, { text: string; linkText: string; href: string } | null> = {
  "/login": null,
  "/forgot-password": {
    text: "Remember your password?",
    linkText: "Log in",
    href: "/login",
  },
};

export default function AuthFooterLink() {
  const pathname = usePathname();
  const link = linkMap[pathname];

  // Don't render footer link for pages not in linkMap or explicitly set to null
  if (!link) {
    return null;
  }

  return (
    <p className="text-sm text-center text-[#838383] absolute bottom-8 left-0 right-0">
      {link.text}{' '}
      <Link href={link.href} className="text-[#ff8c32] font-medium hover:underline">
        {link.linkText}
      </Link>
    </p>
  );
}

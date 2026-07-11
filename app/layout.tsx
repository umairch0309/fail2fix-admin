import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

const interDisplay = localFont({
  src: [
    {
      path: "./fonts/interdisplay/InterDisplay-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/interdisplay/InterDisplay-Italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/interdisplay/InterDisplay-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/interdisplay/InterDisplay-MediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/interdisplay/InterDisplay-SemiBold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/interdisplay/InterDisplay-SemiBoldItalic.woff",
      weight: "600",
      style: "italic",
    },
    {
      path: "./fonts/interdisplay/InterDisplay-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/interdisplay/InterDisplay-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-inter-display",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Fail2Fix Admin",
    template: "%s | Fail2Fix Admin",
  },
  description: "Admin dashboard for managing Fail2Fix garage operations, quotes, orders, and customer communications.",
  keywords: ["Fail2Fix admin", "garage management", "admin dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={interDisplay.variable}>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

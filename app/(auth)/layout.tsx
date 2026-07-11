import Padding from "@/components/padding";
import AuthImage from "./AuthImage";
import AuthFooterLink from "./AuthFooterLink";
import Image from "next/image";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Padding className="h-screen grid grid-cols-1 lg:grid-cols-[minmax(400px,560px)_1fr] py-3 gap-4">
      <div className="flex flex-col p-8 overflow-auto bg-[#F5F5F5] rounded-xl relative">
        <Image src="/images/fail2fix-logo.png" alt="Fail2Fix" width={120} height={48} className="object-contain" />
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
        <AuthFooterLink />
      </div>
      <AuthImage />
    </Padding>
  );
}

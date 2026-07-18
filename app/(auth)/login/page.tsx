import { Suspense } from "react";
import Loginform from "@/components/auth/loginform";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md p-6 text-sm text-gray-500">Loading…</div>}>
      <Loginform />
    </Suspense>
  );
}

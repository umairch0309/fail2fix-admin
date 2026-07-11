"use client";

import { useSession } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="mt-6 max-w-md space-y-4 rounded-lg border p-6">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium">{user?.name || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{user?.email || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="font-medium capitalize">{user?.role || "—"}</p>
        </div>
      </div>
    </div>
  );
}

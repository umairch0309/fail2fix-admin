import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { API_URL } from "./constants";

/**
 * Better Auth Client for Admin Panel
 * Uses admin-specific auth endpoint with different cookie prefix
 * This allows admin and customer to be logged in simultaneously
 *
 * Cookie: admin-auth.session_token
 * Endpoint: /api/admin-auth/*
 *
 * Usage:
 * - authClient.signIn.email({ email, password })
 * - authClient.signOut()
 * - authClient.useSession()
 * - authClient.admin.listUsers() - List all users (admin only)
 * - authClient.admin.setRole() - Change user role (admin only)
 *
 * Note: Admin auth uses simple email/password only (no OTP, no password reset)
 */
export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/admin-auth`, // Admin-specific auth endpoint
  fetchOptions: {
    credentials: 'include', // Required for cross-origin cookie handling
  },
  plugins: [adminClient()],
});

// Export individual methods for convenience
export const { signIn, signOut, useSession, admin } = authClient;

// Extended user type with role (returned from backend)
export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Export types using Better Auth's $Infer property
export type Session = typeof authClient.$Infer.Session;

export default authClient;

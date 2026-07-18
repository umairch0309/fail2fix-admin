import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { API_URL } from "./constants";

/**
 * Same-origin auth base in the browser (via app/api/[...path] proxy → backend).
 * Server components still talk to the absolute API URL when needed.
 *
 * Cookie: admin-auth.session_token
 * Endpoint: /api/admin-auth/*
 */
const authBaseURL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/admin-auth`
    : `${API_URL}/api/admin-auth`;

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [adminClient()],
});

export const { signIn, signOut, useSession, admin } = authClient;

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

export type Session = typeof authClient.$Infer.Session;

export default authClient;

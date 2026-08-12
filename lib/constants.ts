/**
 * App Constants
 *
 * Centralized configuration for consistent usage across the app.
 */

/**
 * Backend API URL
 * Used for all API calls to the separate backend server.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3007";

/**
 * WebSocket URL
 * Used for real-time chat connections.
 * `client=admin` ensures the backend uses admin auth when both cookies exist on localhost.
 */
const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3007";
export const WS_URL = wsBase.includes("?")
  ? `${wsBase}&client=admin`
  : `${wsBase}?client=admin`;

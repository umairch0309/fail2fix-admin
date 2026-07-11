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
 */
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3007";

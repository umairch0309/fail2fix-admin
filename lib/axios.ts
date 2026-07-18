import axios, { AxiosError } from "axios";
import { API_URL } from "./constants";

/**
 * Axios instance for Student App
 *
 * Uses cookie-based authentication (better-auth)
 * - Sessions are stored in httpOnly cookies with prefix "falcon"
 * - Cookies are automatically sent with each request (withCredentials: true)
 * - No need for Authorization headers or localStorage
 */

export const api = axios.create({
  // Browser uses same-origin /api proxy; SSR uses absolute backend URL
  baseURL: typeof window !== "undefined" ? "" : API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically included due to withCredentials: true
    // No need to manually add Authorization headers
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized - session expired or not authenticated
          console.error("Authentication required");
          // Redirect to login page
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          break;
        case 403:
          // Handle forbidden - insufficient permissions
          console.error("Access forbidden - insufficient permissions");
          break;
        case 404:
          // Handle not found
          console.error("Resource not found");
          break;
        case 500:
          // Handle server errors
          console.error("Server error");
          break;
        default:
          console.error("API error:", error.response.status);
          break;
      }
    } else if (error.request) {
      // Request made but no response received
      console.error("Network error - no response from server");
    } else {
      // Error in request setup
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

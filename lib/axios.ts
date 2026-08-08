import axios from "axios";
import { toast } from "@/components/ui/Toast";

// Configure axios defaults
axios.defaults.baseURL = "/api";
axios.defaults.withCredentials = true; // This is crucial for sending cookies
axios.defaults.headers.common["Content-Type"] = "application/json";

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";

    if (error.response?.status === 404) {
      console.error("Resource not found (404)");
    } else if (error.response?.status === 401) {
      console.error("Unauthorized (401)");
    } else if (error.response?.status === 500) {
      console.error("Internal Server Error (500)");
    }

    // Show non-blocking toast notification to user instead of alert()
    if (error.response?.status !== 401) {
      toast.error(errorMessage, "API Error");
    }

    return Promise.reject(error);
  },
);

export default axios;

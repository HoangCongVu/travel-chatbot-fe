import axios from "axios";
import { UUID } from "crypto";

// Cookie management utilities
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;Secure;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;Secure;SameSite=Strict`;
};

// Token management with cookies
export const tokenManager = {
  setToken: (token: string) => {
    setCookie("admin_token", token, 7); // Cookie expires in 7 days
  },

  getToken: (): string | null => {
    return getCookie("admin_token");
  },

  removeToken: () => {
    deleteCookie("admin_token");
  },

  getAuthHeader: () => {
    const token = tokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

export const adminServices = {
  // Admin login
  login: async (email: string, password: string) => {
    try {
      console.log(
        "Admin login request:",
        email,
        process.env.NEXT_PUBLIC_API_URL
      );

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Admin login response:", response.data);

      if (response.data.access_token) {
        // Save token to localStorage
        tokenManager.setToken(response.data.access_token);
      }

      return {
        success: true,
        token: response.data.access_token,
        token_type: response.data.token_type,
        ...response.data,
      };
    } catch (error: any) {
      console.error("Admin login failed:", error);

      if (error.response) {
        return {
          success: false,
          error:
            error.response.data.detail ||
            error.response.data.message ||
            "Admin login failed",
        };
      } else {
        return {
          success: false,
          error: "Network error - Cannot connect to server",
        };
      }
    }
  },

  // Admin logout
  logout: () => {
    tokenManager.removeToken();
    return { success: true };
  },
  fetchAllUsers: async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      if (
        error.response &&
        error.response.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      if (
        error.response &&
        error.response.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(`Get user ${userId} failed:`, error);

      if (
        error.response &&
        error.response.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to get user",
      };
    }
  },

  fetchAllFiles: async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files`,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      if (
        error.response &&
        error.response.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }
      throw error;
    }
  },

  deleteFile: async (fileId: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/${fileId}`,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      if (
        error.response &&
        error.response.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }
      throw error;
    }
  },
  uploadFileAgent: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = tokenManager.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload-files-agent/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      // Handle token expiration
      if (
        error.response?.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }
      throw error;
    }
  },

  // Toggle follow-up feature
  toggleFollowUp: async (action: "enable" | "disable") => {
    try {
      console.log(`Toggle follow-up action: ${action}`);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/follow-up/toggle`,
        { action },
        {
          headers: {
            "Content-Type": "application/json",
            ...tokenManager.getAuthHeader(),
          },
        }
      );

      console.log("Follow-up toggle response:", response.data);

      return {
        success: true,
        data: response.data,
        message: response.data.message || `Follow-up ${action}d successfully`,
      };
    } catch (error: any) {
      console.error("Follow-up toggle failed:", error);

      if (error.response) {
        // Check if token expired
        if (
          error.response.status === 401 &&
          (error.response.data.detail === "Token expired" ||
            error.response.data.detail === "Could not validate credentials")
        ) {
          tokenManager.removeToken();
          window.location.href = "/admin/login";
          return {
            success: false,
            error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          };
        }

        return {
          success: false,
          error:
            error.response.data.detail ||
            error.response.data.message ||
            `Failed to ${action} follow-up`,
        };
      } else {
        return {
          success: false,
          error: "Network error - Cannot connect to server",
        };
      }
    }
  },

  // Get follow-up status
  getFollowUpStatus: async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/follow-up/status`,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );

      return {
        success: true,
        data: response.data.data || response.data,
        isEnabled:
          response.data.data?.is_enabled || response.data.enabled || false,
      };
    } catch (error: any) {
      console.error("Get follow-up status failed:", error);

      // Check if token expired
      if (
        error.response &&
        error.response.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }

      return {
        success: false,
        error: "Failed to get follow-up status",
        isEnabled: false,
      };
    }
  },

  // Update follow-up configuration
  updateFollowUpConfig: async (config: {
    delay_minutes: number;
    max_count: number;
    active_hours_start: number;
    active_hours_end: number;
    scan_interval_minutes: number;
  }) => {
    try {
      console.log("Updating follow-up config:", config);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/follow-up/config`,
        config,
        {
          headers: {
            "Content-Type": "application/json",
            ...tokenManager.getAuthHeader(),
          },
        }
      );

      console.log("Follow-up config update response:", response.data);

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Configuration updated successfully",
      };
    } catch (error: any) {
      console.error("Follow-up config update failed:", error);

      if (error.response) {
        // Check if token expired
        if (
          error.response.status === 401 &&
          (error.response.data.detail === "Token expired" ||
            error.response.data.detail === "Could not validate credentials")
        ) {
          tokenManager.removeToken();
          window.location.href = "/admin/login";
          return {
            success: false,
            error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          };
        }

        return {
          success: false,
          error:
            error.response.data.detail ||
            error.response.data.message ||
            "Failed to update configuration",
        };
      } else {
        return {
          success: false,
          error: "Network error - Cannot connect to server",
        };
      }
    }
  },

  // Get all chats for admin
  getAllChats: async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/all`,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Get all chats failed:", error);

      if (
        error.response &&
        error.response.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }

      return {
        success: false,
        error: "Failed to get chats",
        data: [],
      };
    }
  },

  // Get messages for a specific chat
  getChatMessages: async (chatId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${chatId}`,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Get chat messages failed:", error);

      if (
        error.response &&
        error.response.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }

      return {
        success: false,
        error: "Failed to get messages",
        data: [],
      };
    }
  },

  // Send admin message to user
  sendAdminMessage: async (chatId: string, message: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${chatId}/admin-message`,
        { content: message },
        {
          headers: {
            "Content-Type": "application/json",
            ...tokenManager.getAuthHeader(),
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Send admin message failed:", error);

      if (
        error.response &&
        error.response.status === 401 &&
        (error.response.data.detail === "Token expired" ||
          error.response.data.detail === "Could not validate credentials")
      ) {
        tokenManager.removeToken();
        window.location.href = "/admin/login";
      }

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to send message",
      };
    }
  },
};

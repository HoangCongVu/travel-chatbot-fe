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
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
      {
        headers: tokenManager.getAuthHeader(),
      }
    );
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
      {
        headers: tokenManager.getAuthHeader(),
      }
    );
    return response.data;
  },

  fetchAllFiles: async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/files`,
      {
        headers: tokenManager.getAuthHeader(),
      }
    );
    return response.data;
  },

  deleteFile: async (fileId: string) => {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/files/${fileId}`,
      {
        headers: tokenManager.getAuthHeader(),
      }
    );
    return response.data;
  },
  uploadFileAgent: async (file: File, adminId: UUID) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("admin_id", adminId);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload-files-agent/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(response.data.message);
      return response.data;
    } catch (error: any) {
      alert(
        "Upload thất bại: " + (error.response?.data?.detail || error.message)
      );
      throw error;
    }
  },
};

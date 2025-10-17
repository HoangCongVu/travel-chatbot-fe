import axios from "axios";

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

// User token management with cookies
export const userTokenManager = {
  setToken: (token: string) => {
    setCookie("user_token", token, 7); // Cookie expires in 7 days
  },

  getToken: (): string | null => {
    return getCookie("user_token");
  },

  removeToken: () => {
    deleteCookie("user_token");
  },

  getAuthHeader: () => {
    const token = userTokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Admin token management with cookies
export const adminTokenManager = {
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
    const token = adminTokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

export const authServices = {
  login: async (email: string, password: string) => {
    try {
      console.log(
        "Login request:",
        email,
        password,
        process.env.NEXT_PUBLIC_API_URL
      );
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
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

      console.log("FastAPI Response:", response.data);

      if (response.data.access_token) {
        // Save user token to cookies
        userTokenManager.setToken(response.data.access_token);
      }

      return {
        success: true,
        token: response.data.access_token,
        token_type: response.data.token_type,
        user: response.data.user,
        ...response.data,
      };
    } catch (error: any) {
      console.error("Login failed:", error);

      if (error.response) {
        return {
          success: false,
          error:
            error.response.data.detail ||
            error.response.data.message ||
            "Login failed",
        };
      } else {
        return {
          success: false,
          error: "Network error - Cannot connect to server",
        };
      }
    }
  },
  loginAdmin: async (email: string, password: string) => {
    try {
      console.log(
        "Login Admin request:",
        email,
        password,
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

      console.log("FastAPI Response:", response.data);

      if (response.data.access_token) {
        // Save admin token to cookies
        adminTokenManager.setToken(response.data.access_token);
      }

      return {
        success: true,
        token: response.data.access_token,
        token_type: response.data.token_type,
        user: response.data.user,
        ...response.data,
      };
    } catch (error: any) {
      console.error("Login failed:", error);

      if (error.response) {
        return {
          success: false,
          error:
            error.response.data.detail ||
            error.response.data.message ||
            "Login failed",
        };
      } else {
        return {
          success: false,
          error: "Network error - Cannot connect to server",
        };
      }
    }
  },

  // User register
  register: async (
    fullName: string,
    phoneNumber: string,
    email: string,
    password: string
  ) => {
    try {
      console.log(
        "Register request:",
        fullName,
        phoneNumber,
        email,
        process.env.NEXT_PUBLIC_API_URL
      );
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/create`,
        {
          full_name: fullName,
          phone_number: phoneNumber,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Register Response:", response.data);

      return {
        success: true,
        user: response.data.user,
        message: response.data.message || "Đăng ký thành công",
        ...response.data,
      };
    } catch (error: any) {
      console.error("Register failed:", error);

      if (error.response) {
        return {
          success: false,
          error:
            error.response.data.detail ||
            error.response.data.message ||
            "Đăng ký thất bại",
        };
      } else {
        return {
          success: false,
          error: "Lỗi mạng - Không thể kết nối đến server",
        };
      }
    }
  },

  // User logout
  logout: () => {
    userTokenManager.removeToken();
    return { success: true };
  },

  // Admin logout
  logoutAdmin: () => {
    adminTokenManager.removeToken();
    return { success: true };
  },
};

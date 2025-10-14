import axios from "axios";

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

      return {
        success: true,
        token: response.data.access_token,
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

      return {
        success: true,
        token: response.data.access_token,
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
};

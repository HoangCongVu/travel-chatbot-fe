"use client";

import { useState, useEffect } from "react";
import { adminServices } from "@/services/adminServices";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export default function LoginStaffForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "logout";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const router = useRouter();

  const showNotification = (
    type: "success" | "error" | "logout",
    message: string
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type, message: "" });
    }, 3000);
  };

  useEffect(() => {
    // Check if user just logged out
    const logoutSuccess = localStorage.getItem("staff_logout_success");
    if (logoutSuccess === "true") {
      localStorage.removeItem("staff_logout_success");
      showNotification("logout", "Đăng xuất thành công!");
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Staff login attempt:", formData);

      // Call admin login API (same API, different role check)
      const res = await adminServices.login(formData.email, formData.password);
      console.log("Staff login response:", res);

      if (res.success) {
        // Get role from localStorage (saved by adminServices.login)
        const userRole = localStorage.getItem("role");
        console.log("User role from localStorage:", userRole);

        // Check if user has staff role
        if (res.role === "staff") {
          showNotification("success", "Đăng nhập thành công!");
          setTimeout(() => {
            router.push("/staff");
          }, 500);
        } else {
          // Wrong role
          adminServices.logout(); // Clear token and role
          showNotification(
            "error",
            "Bạn không có quyền truy cập vào trang Staff. Vui lòng đăng nhập bằng tài khoản Staff."
          );
        }
      } else {
        throw new Error(res.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      showNotification(
        "error",
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div
            className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 ${
              notification.type === "success"
                ? "bg-white border-green-500"
                : notification.type === "logout"
                ? "bg-white border-red-500"
                : "bg-white border-red-500"
            } max-w-md`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              ) : notification.type === "logout" ? (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-red-500" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${
                  notification.type === "success"
                    ? "text-green-800"
                    : notification.type === "logout"
                    ? "text-red-800"
                    : "text-red-800"
                }`}
              >
                {notification.type === "success"
                  ? "Thành công!"
                  : notification.type === "logout"
                  ? "Thành công!"
                  : "Lỗi!"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng Staff đến với
          </h1>
          <div className="text-4xl font-bold flex items-center justify-center gap-2">
            <span className="text-blue-500">TravelAI</span>
            <span className="text-gray-700">Staff Portal</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-3 bg-blue-50 border border-blue-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@gmail.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-3 py-3 bg-blue-50 border border-blue-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium text-sm transition-colors ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
            >
              Quên mật khẩu?
            </a>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Cần hỗ trợ?{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Liên hệ Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

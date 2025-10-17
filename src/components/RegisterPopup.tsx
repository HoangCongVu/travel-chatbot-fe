"use client";

import { useState } from "react";
import { authServices } from "@/services/authServices";

interface RegisterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterPopup({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterPopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate input
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        throw new Error("Vui lòng nhập đầy đủ thông tin");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Mật khẩu xác nhận không khớp");
      }

      if (formData.password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }

      // Call register API
      const res = await authServices.register(
        formData.name, // full_name
        formData.phone, // phone_number
        formData.email, // email
        formData.password // password
      );

      if (res.success) {
        setSuccess(true);
        // Auto switch to login after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          onSwitchToLogin();
        }, 2000);
      } else {
        throw new Error(res.error || "Đăng ký thất bại");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      setError(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-100 max-w-md mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl text-black font-bold">Đăng ký</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Đăng ký thành công!
            </h3>
            <p className="text-gray-600">Đang chuyển đến trang đăng nhập...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Nhận tài khoản Du Lịch Việt và khám phá niềm vui của bạn ở bất cứ
              đâu
            </p>

            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên (*)
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (*)
                </label>
                <input
                  type="email"
                  placeholder="Nhập email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại (*)
                </label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu (*)
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu (*)
                </label>
                <input
                  type="password"
                  placeholder="Nhập xác nhận mật khẩu..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-md font-medium transition-colors cursor-pointer"
              >
                {loading ? "Đang đăng ký..." : "ĐĂNG KÝ"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-blue-500 hover:text-blue-600 text-sm cursor-pointer"
              >
                Đã có tài khoản? Đăng nhập ngay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

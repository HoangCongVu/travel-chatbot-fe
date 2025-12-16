"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { paymentServices, getUserId } from "@/services/paymentServices";
import { cartServices, cartStorage } from "@/services/cartServices";
import { userTokenManager } from "@/services/authServices";
import {
  ShoppingCart,
  User,
  Mail,
  Phone,
  Users,
  UserPlus,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

interface CartItem {
  id: string;
  tour_id: string;
  quantity: number;
  price_snapshot: number;
  travel_date: string;
}

export default function BookingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState({
    total_price: 0,
    total_items: 0,
  });

  // Form data
  const [formData, setFormData] = useState({
    adult_count: 1,
    child_count: 0,
    special_request: "",
    // Guest info
    guest_name: "",
    guest_phone: "",
    guest_email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState("");

  // Load auth status and cart
  useEffect(() => {
    const token = userTokenManager.getToken();
    setIsLoggedIn(!!token);
    loadCart();
  }, []);

  const loadCart = async () => {
    const cartId = cartStorage.getCartId();
    if (!cartId) {
      router.push("/");
      return;
    }

    try {
      const [items, total] = await Promise.all([
        cartServices.getCartItems(cartId),
        cartServices.getCartTotal(cartId),
      ]);

      if (items.length === 0) {
        router.push("/");
        return;
      }

      setCartItems(items);
      setCartTotal(total);
    } catch (error) {
      console.error("❌ Error loading cart:", error);
      router.push("/");
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.adult_count < 1) {
      newErrors.adult_count = "Phải có ít nhất 1 người lớn";
    }

    if (!isLoggedIn) {
      if (!formData.guest_name.trim()) {
        newErrors.guest_name = "Vui lòng nhập họ tên";
      }
      if (!formData.guest_phone.trim()) {
        newErrors.guest_phone = "Vui lòng nhập số điện thoại";
      } else if (!/^[0-9]{10,11}$/.test(formData.guest_phone)) {
        newErrors.guest_phone = "Số điện thoại không hợp lệ";
      }
      if (!formData.guest_email.trim()) {
        newErrors.guest_email = "Vui lòng nhập email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guest_email)) {
        newErrors.guest_email = "Email không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitMessage("❌ Vui lòng kiểm tra lại thông tin");
      setTimeout(() => setSubmitMessage(""), 3000);
      return;
    }

    const cartId = cartStorage.getCartId();
    if (!cartId) return;

    try {
      setLoading(true);
      setSubmitMessage("");

      const token = userTokenManager.getToken();

      if (token) {
        // User checkout - có token, backend tự xử lý user_id
        const userBookings = await paymentServices.checkoutUser({
          cart_id: cartId,
          adult_count: formData.adult_count,
          child_count: formData.child_count,
          special_request: formData.special_request || undefined,
        });

        // Create payment for first booking
        if (userBookings && userBookings.length > 0) {
          const firstBookingId = userBookings[0].id;
          console.log("📝 Creating payment for booking_id:", firstBookingId);

          const payment = await paymentServices.createPaymentForBooking({
            booking_id: firstBookingId,
            payment_method: "sepay",
          });

          console.log("✅ Payment created:", payment);

          // Clear cart and redirect to payment page
          cartStorage.clearCartStorage();
          router.push(`/payment?payment_id=${payment.id}`);
          return;
        }
      } else {
        // Guest checkout - không có token
        const sessionId = cartStorage.getSessionId();
        if (!sessionId) {
          throw new Error("Session ID not found");
        }

        const guestBookings = await paymentServices.checkoutGuest({
          cart_id: cartId,
          session_id: sessionId,
          guest_name: formData.guest_name,
          guest_phone: formData.guest_phone,
          guest_email: formData.guest_email,
          adult_count: formData.adult_count,
          child_count: formData.child_count,
          special_request: formData.special_request || undefined,
        });

        // Create payment for first booking
        if (guestBookings && guestBookings.length > 0) {
          const firstBookingId = guestBookings[0].id;
          const payment = await paymentServices.createPaymentForBooking({
            booking_id: firstBookingId,
            payment_method: "sepay",
          });

          // Clear cart and redirect to payment page
          cartStorage.clearCartStorage();
          router.push(`/payment?payment_id=${payment.id}`);
          return;
        }
      }

      // Fallback if no bookings created
      cartStorage.clearCartStorage();
      setSubmitMessage("✅ Đặt tour thành công!");
      setTimeout(() => {
        router.push("/bookings");
      }, 2000);
    } catch (error: any) {
      console.error("❌ Error creating booking:", error);
      setSubmitMessage(
        error.response?.data?.detail || "❌ Có lỗi xảy ra, vui lòng thử lại"
      );
      setTimeout(() => setSubmitMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const totalTravelers = formData.adult_count + formData.child_count;
  const estimatedTotal = cartTotal.total_price * totalTravelers;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">
                <span className="text-blue-500">Travel</span>
                <span className="text-gray-700">AI</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">Thanh toán</span>
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-500" />
                Thông tin đặt tour
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Guest Information - Only for non-logged-in users */}
                {!isLoggedIn && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                      Thông tin khách hàng
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.guest_name}
                          onChange={(e) =>
                            handleInputChange("guest_name", e.target.value)
                          }
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            errors.guest_name
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                          }`}
                          placeholder="Nguyễn Văn A"
                        />
                        {errors.guest_name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.guest_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.guest_phone}
                          onChange={(e) =>
                            handleInputChange("guest_phone", e.target.value)
                          }
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            errors.guest_phone
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                          }`}
                          placeholder="0123456789"
                        />
                        {errors.guest_phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.guest_phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.guest_email}
                          onChange={(e) =>
                            handleInputChange("guest_email", e.target.value)
                          }
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            errors.guest_email
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                          }`}
                          placeholder="email@example.com"
                        />
                        {errors.guest_email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.guest_email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Traveler Count */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Số lượng hành khách
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Người lớn (≥ 12 tuổi){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.adult_count}
                        onChange={(e) =>
                          handleInputChange(
                            "adult_count",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.adult_count
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                      />
                      {errors.adult_count && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.adult_count}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Trẻ em (&lt; 12 tuổi)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.child_count}
                        onChange={(e) =>
                          handleInputChange(
                            "child_count",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Request */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                    Yêu cầu đặc biệt (không bắt buộc)
                  </label>
                  <textarea
                    value={formData.special_request}
                    onChange={(e) =>
                      handleInputChange("special_request", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 transition-all resize-none"
                    placeholder="Ví dụ: Yêu cầu phòng tầng cao, cần ghế ngồi đặc biệt..."
                  />
                </div>

                {/* Submit Message */}
                {submitMessage && (
                  <div
                    className={`p-4 rounded-lg text-center font-medium ${
                      submitMessage.includes("✅")
                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                        : "bg-red-100 text-red-700 border-2 border-red-300"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      <span>Xác nhận đặt tour</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Thông tin đơn hàng
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số tour:</span>
                  <span className="font-semibold">{cartTotal.total_items}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng hành khách:</span>
                  <span className="font-semibold">{totalTravelers} người</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>• Người lớn:</span>
                  <span>{formData.adult_count}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>• Trẻ em:</span>
                  <span>{formData.child_count}</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    Tổng cộng:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {estimatedTotal.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Giá đã bao gồm VAT
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Sau khi xác nhận, chúng tôi sẽ liên hệ
                  với bạn để xác nhận thông tin đặt tour.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import { cartServices, cartStorage } from "@/services/cartServices";

interface CartItem {
  id: string;
  cart_id: string;
  tour_id: string;
  tour_name: string;
  quantity: number;
  price_snapshot: number;
  travel_date: string;
  created_at: string;
  updated_at: string;
}

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate?: () => void;
}

export default function CartPopup({
  isOpen,
  onClose,
  onCartUpdate,
}: CartPopupProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState({
    total_price: 0,
    total_items: 0,
  });
  const [loadingCart, setLoadingCart] = useState(false);
  const [notification, setNotification] = useState("");

  // Load cart data
  const loadCart = async () => {
    const cartId = cartStorage.getCartId();
    if (!cartId) return;

    try {
      setLoadingCart(true);
      const [items, total] = await Promise.all([
        cartServices.getCartItems(cartId),
        cartServices.getCartTotal(cartId),
      ]);
      setCartItems(items);
      setCartTotal(total);
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      console.error("❌ Error loading cart:", error);
    } finally {
      setLoadingCart(false);
    }
  };

  // Load cart when popup opens
  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  // Handle remove item from cart
  const handleRemoveCartItem = async (itemId: string) => {
    try {
      await cartServices.removeCartItem(itemId);
      setNotification("✅ Đã xóa tour khỏi giỏ hàng");
      setTimeout(() => setNotification(""), 2000);
      await loadCart();
    } catch (error) {
      console.error("❌ Error removing item:", error);
      setNotification("❌ Không thể xóa tour khỏi giỏ hàng");
      setTimeout(() => setNotification(""), 2000);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    const cartId = cartStorage.getCartId();
    if (!cartId) return;

    if (!confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;

    try {
      await cartServices.clearCart(cartId);
      setNotification("✅ Đã xóa toàn bộ giỏ hàng");
      setTimeout(() => setNotification(""), 2000);
      await loadCart();
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
      setNotification("❌ Không thể xóa giỏ hàng");
      setTimeout(() => setNotification(""), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Cart Popup - Enhanced Beautiful Design */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center lg:justify-end z-[60] animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-t-3xl lg:rounded-l-3xl lg:rounded-r-none w-full lg:w-[520px] max-h-[92vh] lg:h-full overflow-hidden shadow-2xl animate-slide-up lg:animate-slide-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white p-6 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-lg">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Giỏ hàng</h2>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {cartTotal.total_items > 0
                      ? `${cartTotal.total_items} tour đã chọn`
                      : "Chưa có tour nào"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-white/20 rounded-full p-2.5 transition-all hover:rotate-90 duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div className="mx-5 mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium text-center">
              {notification}
            </div>
          )}

          {/* Cart Content */}
          <div className="flex flex-col h-[calc(92vh-180px)] lg:h-[calc(100vh-180px)]">
            {loadingCart ? (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    Đang tải giỏ hàng...
                  </p>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 bg-gradient-to-b from-gray-50 to-white">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-full mb-6 shadow-inner">
                  <ShoppingCart
                    className="w-24 h-24 text-blue-400"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-xl font-bold text-gray-700 mb-2">
                  Giỏ hàng trống
                </p>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Khám phá các tour du lịch tuyệt vời và thêm vào giỏ hàng ngay!
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  Khám phá tour
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List with custom scrollbar */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white custom-scrollbar">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              TOUR #{item.tour_id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-700">
                              <span className="text-2xl mr-2">📅</span>
                              <div>
                                <span className="text-xs text-gray-500 block">
                                  Ngày khởi hành
                                </span>
                                <span className="font-semibold">
                                  {new Date(
                                    item.travel_date
                                  ).toLocaleDateString("vi-VN", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-2xl mr-2">🧭</span>
                              <div>
                                <span className="text-xs text-gray-500 block">
                                  Tên tour
                                </span>
                                <span className="font-semibold">
                                  {item.tour_name}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-2xl mr-2">👥</span>
                              <div>
                                <span className="text-xs text-gray-500 block">
                                  Số lượng người
                                </span>
                                <span className="font-semibold">
                                  {item.quantity} người
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCartItem(item.id)}
                          className="group/btn text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl p-2.5 transition-all hover:scale-110"
                          title="Xóa khỏi giỏ hàng"
                        >
                          <Trash2 className="w-5 h-5 group-hover/btn:animate-wiggle" />
                        </button>
                      </div>

                      {/* Price section with gradient background */}
                      <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Thành tiền
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-gray-400 line-through">
                            {(
                              item.price_snapshot *
                              item.quantity *
                              1.2
                            ).toLocaleString("vi-VN")}{" "}
                            đ
                          </div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {(
                              item.price_snapshot * item.quantity
                            ).toLocaleString("vi-VN")}{" "}
                            đ
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer with Total and Actions - Fixed at bottom */}
                <div className="border-t-2 border-gray-100 p-2 bg-white shadow-2xl">
                  {/* Total with gradient background */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-5 mb-4 shadow-lg">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>

                    <div className="relative">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white/90 font-medium text-lg">
                          Tổng thanh toán
                        </span>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white drop-shadow-lg">
                            {cartTotal.total_price.toLocaleString("vi-VN")} đ
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-blue-100 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                        <span className="flex items-center">
                          <span className="mr-2">🎫</span>
                          {cartTotal.total_items} tour
                        </span>
                        <span className="flex items-center">
                          <span className="mr-2">👥</span>
                          {cartItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          người
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        onClose();
                        router.push("/booking");
                      }}
                      className="group w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                      <span className="text-xl">💳</span>
                      <span>Thanh toán ngay</span>
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

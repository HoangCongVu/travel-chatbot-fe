import axios from "axios";
import { userTokenManager } from "./authServices";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const cartServices = {
  // Tạo giỏ hàng cho user đã đăng nhập
  createCartForUser: async (userId: string) => {
    const token = userTokenManager.getToken();
    const response = await axios.post(
      `${API_URL}/api/carts/create/user`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // Tạo giỏ hàng cho guest (tự động tạo session_id)
  createCartForGuest: async () => {
    const response = await axios.post(`${API_URL}/api/carts/create/guest`);
    return response.data;
  },

  // Thêm tour vào giỏ hàng
  addToCart: async (data: {
    cart_id: string;
    tour_id: string;
    tour_name: string;
    travel_date: string;
    quantity: number;
  }) => {
    const response = await axios.post(
      `${API_URL}/api/cart-items/add-to-cart`,
      data
    );
    return response.data;
  },

  // Lấy tất cả items trong giỏ
  getCartItems: async (cartId: string) => {
    const response = await axios.get(
      `${API_URL}/api/cart-items/cart/${cartId}`
    );
    return response.data;
  },

  // Tính tổng giỏ hàng
  getCartTotal: async (cartId: string) => {
    const response = await axios.get(
      `${API_URL}/api/cart-items/cart/${cartId}/total`
    );
    return response.data;
  },

  // Update quantity của cart item
  updateCartItemQuantity: async (itemId: string, quantity: number) => {
    const response = await axios.put(
      `${API_URL}/api/cart-items/${itemId}/quantity`,
      {
        quantity,
      }
    );
    return response.data;
  },

  // Xóa item khỏi giỏ hàng
  removeCartItem: async (itemId: string) => {
    const response = await axios.delete(`${API_URL}/api/cart-items/${itemId}`);
    return response.data;
  },

  // Clear toàn bộ giỏ hàng
  clearCart: async (cartId: string) => {
    const response = await axios.delete(
      `${API_URL}/api/cart-items/cart/${cartId}/clear`
    );
    return response.data;
  },
};

// Helper functions để quản lý cart trong localStorage
export const cartStorage = {
  // Lưu cart_id vào localStorage
  setCartId: (cartId: string) => {
    localStorage.setItem("cart_id", cartId);
  },

  // Lấy cart_id từ localStorage
  getCartId: (): string | null => {
    return localStorage.getItem("cart_id");
  },

  // Lưu session_id vào localStorage (cho guest)
  setSessionId: (sessionId: string) => {
    localStorage.setItem("session_id", sessionId);
  },

  // Lấy session_id từ localStorage
  getSessionId: (): string | null => {
    return localStorage.getItem("session_id");
  },

  // Xóa cart và session khỏi localStorage
  clearCartStorage: () => {
    localStorage.removeItem("cart_id");
    localStorage.removeItem("session_id");
  },

  // Khởi tạo giỏ hàng (tự động tạo nếu chưa có)
  initializeCart: async (userId?: string): Promise<string> => {
    let cartId = cartStorage.getCartId();

    // Nếu đã có cart_id thì return luôn
    if (cartId) {
      return cartId;
    }

    // Tạo cart mới
    try {
      let cart;
      if (userId) {
        // User đã đăng nhập
        cart = await cartServices.createCartForUser(userId);
      } else {
        // Guest
        cart = await cartServices.createCartForGuest();
        if (cart.session_id) {
          cartStorage.setSessionId(cart.session_id);
        }
      }

      cartStorage.setCartId(cart.id);
      return cart.id;
    } catch (error) {
      console.error("❌ Error initializing cart:", error);
      throw error;
    }
  },
};

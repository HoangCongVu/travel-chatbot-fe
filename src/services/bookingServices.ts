import axios from "axios";

// Cookie management utilities
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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CartItem {
  id: string;
  cart_id: string;
  tour_id: string;
  quantity: number;
  price_snapshot: number;
  travel_date: string;
}

export interface Booking {
  id: string;
  user_id: string | null;
  session_id: string;
  tour_id: string;
  cart_item_id: string;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  adult_count: number;
  child_count: number;
  total_price: number;
  status: string;
  special_request: string | null;
  cart_item: CartItem;
}

export const bookingServices = {
  // Get all chatbot bookings (Admin only)
  getChatbotBookings: async (
    skip: number = 0,
    limit: number = 100
  ): Promise<Booking[]> => {
    const token = getCookie("admin_token") || getCookie("staff_token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/bookings/chatbot/bookings`,
        {
          params: { skip, limit },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || "Failed to fetch chatbot bookings"
        );
      }
      throw error;
    }
  },
};

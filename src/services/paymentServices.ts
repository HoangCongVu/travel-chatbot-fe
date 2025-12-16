import axios from "axios";
import { userTokenManager } from "./authServices";
import { tokenManager } from "./adminServices";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface BookingRequest {
  cart_id: string;
  adult_count: number;
  child_count?: number;
  special_request?: string;
  meta_data?: Record<string, any>;
}

export interface GuestBookingRequest extends BookingRequest {
  session_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
}

export interface Booking {
  id: string;
  booking_id: string;
  user_id?: string;
  session_id?: string;
  tour_id: string;
  travel_date: string;
  adult_count: number;
  child_count: number;
  total_price: number;
  status: string;
  special_request?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  meta_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  payment_url: string;
  meta_data?: Record<string, any>;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  booking_id: string;
  payment_method: "sepay";
}

export interface PaymentStatistics {
  pending: number;
  processing: number;
  success: number;
  failed: number;
  refunded: number;
}

export interface TotalSuccessAmountResponse {
  status: string;
  total_success_amount: number;
  message: string;
}

export const paymentServices = {
  /**
   * Checkout for logged-in user
   * Creates bookings from cart items
   * Backend extracts user_id from token
   */
  checkoutUser: async (bookingData: BookingRequest): Promise<Booking[]> => {
    const token = userTokenManager.getToken();
    const response = await axios.post(
      `${API_URL}/api/bookings/checkout/user`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  /**
   * Checkout for guest (not logged in)
   * Creates bookings with guest information
   */
  checkoutGuest: async (
    bookingData: GuestBookingRequest
  ): Promise<Booking[]> => {
    const response = await axios.post(
      `${API_URL}/api/bookings/checkout/guest`,
      bookingData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  /**
   * Get all bookings for a user
   */
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    const token = userTokenManager.getToken();
    const response = await axios.get(`${API_URL}/api/bookings/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Get booking details by ID
   */
  getBookingById: async (bookingId: string): Promise<Booking> => {
    const token = userTokenManager.getToken();
    const response = await axios.get(`${API_URL}/api/bookings/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId: string): Promise<Booking> => {
    const token = userTokenManager.getToken();
    const response = await axios.put(
      `${API_URL}/api/bookings/${bookingId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Create payment for booking
   * Generates QR code for payment
   */
  createPaymentForBooking: async (
    paymentData: CreatePaymentRequest
  ): Promise<Payment> => {
    const response = await axios.post(
      `${API_URL}/api/payments/create-for-booking`,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  /**
   * Get payment details by ID
   */
  getPaymentById: async (paymentId: string): Promise<Payment> => {
    const response = await axios.get(`${API_URL}/api/payments/${paymentId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  /**
   * Check payment status by ID
   * Returns payment status and message
   */
  checkPaymentStatus: async (
    paymentId: string
  ): Promise<{
    success: boolean;
    message: string;
    payment_status: string;
    payment_id: string;
    transaction_id?: string;
    amount?: number;
    paid_at?: string;
  }> => {
    const response = await axios.get(
      `${API_URL}/api/payments/check-status/${paymentId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  /**
   * Get payment statistics
   * Admin and Staff can view statistics
   */
  getStatistics: async (): Promise<PaymentStatistics> => {
    const token = tokenManager.getToken();
    const response = await axios.get(`${API_URL}/api/payments/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  /**
   * Get total success amount
   * Admin and Staff can view total amount from successful transactions
   */
  getTotalSuccessAmount: async (): Promise<TotalSuccessAmountResponse> => {
    const token = tokenManager.getToken();
    const response = await axios.get(
      `${API_URL}/api/payments/total-success-amount`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },
};

// Helper để lấy user_id từ localStorage
export const getUserId = (): string | null => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      // Support cả user_id và id
      return parsed.user_id || parsed.id || null;
    }
  } catch (error) {
    console.error("Error getting user_id:", error);
  }
  return null;
};

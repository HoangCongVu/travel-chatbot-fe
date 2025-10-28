import axios from "axios";
import { userTokenManager } from "./authServices";
import { UUID } from "crypto";

// Chat service interfaces
export interface CreateChatRequest {
  title: string;
}

export interface ChatResponse {
  id: UUID;
  user_id: string | null;
  session_id: UUID;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatBotRequest {
  chat_id: string;
  message: string;
}

export interface ChatBotResponse {
  reply: string;
  chat_id?: string;
  message_id?: string;
}

export const chatServices = {
  // Tạo chat cho user đã đăng nhập
  createUserChat: async (title: string): Promise<any> => {
    try {
      const requestData: CreateChatRequest = { title };
      const authHeaders = userTokenManager.getAuthHeader();

      console.log("Creating user chat with headers:", authHeaders);
      console.log(
        "Token available:",
        userTokenManager.getToken() ? "Yes" : "No"
      );

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/userchat`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        }
      );

      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
        session_id: response.data?.session_id,
      };
    } catch (error: any) {
      console.error("Create user chat error:", error);
      return {
        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to create user chat",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Tạo chat cho user chưa đăng nhập (anonymous)
  createAnonymousChat: async (title: string): Promise<any> => {
    try {
      const requestData: CreateChatRequest = { title };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/anonymouschat`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
        session_id: response.data?.session_id,
      };
    } catch (error: any) {
      console.error("Create anonymous chat error:", error);
      return {
        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to create anonymous chat",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Helper function để tạo chat dựa trên trạng thái đăng nhập
  createChat: async (
    title: string,
    isAuthenticated: boolean = false
  ): Promise<any> => {
    if (isAuthenticated) {
      return chatServices.createUserChat(title);
    } else {
      return chatServices.createAnonymousChat(title);
    }
  },

  // Gửi tin nhắn đến chatbot
  sendMessageToChatBot: async (
    chatId: string,
    message: string
  ): Promise<any> => {
    try {
      const requestData: ChatBotRequest = {
        chat_id: chatId,
        message: message,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat-bot`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        data: response.data,
        success: true,
        status: response.status,
        botResponse: response.data?.reply,
        messageId: response.data?.message_id,
      };
    } catch (error: any) {
      console.error("Send message to chatbot error:", error);
      return {
        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to send message to chatbot",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Generic API methods
  post: async (
    endpoint: string,
    data?: any,
    requireAuth: boolean = false
  ): Promise<any> => {
    try {
      const headers: any = {
        "Content-Type": "application/json",
      };

      if (requireAuth) {
        Object.assign(headers, userTokenManager.getAuthHeader());
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        data,
        { headers }
      );

      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error(`POST ${endpoint} error:`, error);
      return {
        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "API request failed",
        success: false,
        status: error.response?.status,
      };
    }
  },

  get: async (
    endpoint: string,
    params?: any,
    requireAuth: boolean = false
  ): Promise<any> => {
    try {
      const headers: any = {
        "Content-Type": "application/json",
      };

      if (requireAuth) {
        Object.assign(headers, userTokenManager.getAuthHeader());
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          params,
          headers,
        }
      );

      return {
        data: response.data,
        success: true,
        status: response.status,
      };
    } catch (error: any) {
      console.error(`GET ${endpoint} error:`, error);
      return {
        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "API request failed",
        success: false,
        status: error.response?.status,
      };
    }
  },
};

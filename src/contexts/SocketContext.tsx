"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "admin";
  created_at: string;
  chat_id: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  joinAdminRoom: () => void;
  leaveAdminRoom: () => void;
  sendMessage: (chatId: string, content: string, role?: string) => void;
  onNewMessage: (callback: (message: Message) => void) => void;
  offNewMessage: (callback: (message: Message) => void) => void;
  onAdminNotification: (callback: (data: any) => void) => void;
  offAdminNotification: (callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Kết nối đến Socket.IO server
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket.IO connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔴 Socket.IO connection error:", error);
      setIsConnected(false);
    });

    socketInstance.on("joined_chat", (data) => {
      console.log("✅ Joined chat:", data);
    });

    socketInstance.on("left_chat", (data) => {
      console.log("👋 Left chat:", data);
    });

    // DEBUG: Listen tất cả events (chỉ log, không xử lý)
    socketInstance.onAny((eventName, ...args) => {
      console.log("🎯 Socket event received:", eventName, args);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinChat = useCallback(
    (chatId: string) => {
      if (socket) {
        console.log("🚪 Joining chat:", chatId);
        socket.emit("join_chat", { chat_id: chatId });
      }
    },
    [socket]
  );

  const leaveChat = useCallback(
    (chatId: string) => {
      if (socket) {
        console.log("🚪 Leaving chat:", chatId);
        socket.emit("leave_chat", { chat_id: chatId });
      }
    },
    [socket]
  );

  const joinAdminRoom = useCallback(() => {
    if (socket) {
      console.log("👮 Joining admin room");
      socket.emit("join_admin_room");
    }
  }, [socket]);

  const leaveAdminRoom = useCallback(() => {
    if (socket) {
      console.log("👮 Leaving admin room");
      socket.emit("leave_admin_room");
    }
  }, [socket]);

  const sendMessage = useCallback(
    (chatId: string, content: string, role: string = "user") => {
      if (socket) {
        console.log("📤 Sending message:", { chatId, content, role });
        socket.emit("send_message", {
          chat_id: chatId,
          content,
          role,
        });
      }
    },
    [socket]
  );

  const onNewMessage = useCallback(
    (callback: (message: Message) => void) => {
      if (socket) {
        console.log("📡 Registering new_message listener");
        socket.on("new_message", callback);
      } else {
        console.warn("⚠️ Socket not available for registering listener");
      }
    },
    [socket]
  );

  const offNewMessage = useCallback(
    (callback: (message: Message) => void) => {
      if (socket) {
        console.log("🔇 Unregistering new_message listener");
        socket.off("new_message", callback);
      }
    },
    [socket]
  );

  const onAdminNotification = useCallback(
    (callback: (data: any) => void) => {
      if (socket) {
        console.log("📢 Registering admin_notification listener");
        socket.on("admin_notification", callback);
      }
    },
    [socket]
  );

  const offAdminNotification = useCallback(
    (callback: (data: any) => void) => {
      if (socket) {
        console.log("🔇 Unregistering admin_notification listener");
        socket.off("admin_notification", callback);
      }
    },
    [socket]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChat,
        leaveChat,
        joinAdminRoom,
        leaveAdminRoom,
        sendMessage,
        onNewMessage,
        offNewMessage,
        onAdminNotification,
        offAdminNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

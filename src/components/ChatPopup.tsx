"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  MessageSquareDashed,
  Bot,
  User,
  Forward,
  Logs,
  Plus,
  X,
} from "lucide-react";
import { chatServices } from "@/services/chatServices";
import { userTokenManager } from "@/services/authServices";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatPopupProps {
  isLoggedIn?: boolean;
  userEmail?: string;
  onTokenExpired?: () => void;
}

export default function ChatPopup({
  isLoggedIn = false,
  userEmail = "",
  onTokenExpired,
}: ChatPopupProps) {
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Xin Chào Quý Khách! Travel AI sẵn sàng hỗ trợ ạ.",
      isBot: true,
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "Em là nhân viên Travel AI xin được hỗ trợ Quý Anh/Chị ạ.",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type, message: "" });
    }, 3000);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };

  const handleShowChatHistory = async () => {
    if (!isLoggedIn) {
      showNotification("info", "Vui lòng đăng nhập để xem lịch sử chat");
      return;
    }

    try {
      const response = await chatServices.getUserChats("");
      if (response.success) {
        setChatHistory(response.chats || []);
        setShowChatHistory(true);
      } else if (
        response.error &&
        (response.error.includes("Token expired") ||
          response.error.includes("expired"))
      ) {
        if (onTokenExpired) onTokenExpired();
      } else {
        // Nếu không có lịch sử chat hoặc chưa có chat nào, vẫn mở history view
        setChatHistory([]);
        setShowChatHistory(true);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      showNotification("error", "Có lỗi xảy ra khi tải lịch sử chat");
    }
  };

  const handleSelectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    setShowChatHistory(false);

    try {
      const response = await chatServices.getChatMessages(chatId);
      if (response.success) {
        const transformedMessages = response.messages.map(
          (msg: any, index: number) => ({
            id: index + 1,
            text: msg.content || msg.text,
            isBot:
              msg.sender === "bot" ||
              msg.sender === "system" ||
              msg.sender === "admin" ||
              msg.role === "assistant" ||
              msg.role === "admin",
            timestamp: new Date(msg.created_at || msg.timestamp),
          })
        );
        setMessages(transformedMessages);
      } else if (
        response.error &&
        (response.error.includes("Token expired") ||
          response.error.includes("expired"))
      ) {
        if (onTokenExpired) onTokenExpired();
      } else {
        showNotification("error", "Không thể tải tin nhắn");
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      showNotification("error", "Có lỗi xảy ra khi tải tin nhắn");
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    showConfirm(
      "Xóa đoạn chat",
      "Bạn có chắc chắn muốn xóa đoạn chat này không?",
      async () => {
        try {
          const response = await chatServices.deleteChat(chatId);
          if (response.success) {
            setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));

            if (currentChatId === chatId) {
              setCurrentChatId(null);
              setMessages([
                {
                  id: 1,
                  text: "Xin Chào Quý Khách! Travel AI sẵn sàng hỗ trợ ạ.",
                  isBot: true,
                  timestamp: new Date(),
                },
                {
                  id: 2,
                  text: "Em là nhân viên Travel AI xin được hỗ trợ Quý Anh/Chị ạ.",
                  isBot: true,
                  timestamp: new Date(),
                },
              ]);
            }
            showNotification("success", "Đã xóa đoạn chat thành công");
          } else if (
            response.error &&
            (response.error.includes("Token expired") ||
              response.error.includes("expired"))
          ) {
            if (onTokenExpired) onTokenExpired();
          } else {
            showNotification("error", "Không thể xóa chat");
          }
        } catch (error) {
          console.error("Error deleting chat:", error);
          showNotification("error", "Có lỗi xảy ra khi xóa chat");
        }
      }
    );
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const messageText = newMessage.trim();

      const userMessage = {
        id: messages.length + 1,
        text: messageText,
        isBot: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");

      try {
        let chatId = currentChatId;

        if (!chatId) {
          console.log("Creating new chat with title:", messageText);
          const createChatResponse = isLoggedIn
            ? await chatServices.createUserChat(messageText)
            : await chatServices.createAnonymousChat(messageText);

          if (createChatResponse.success) {
            chatId = createChatResponse.data.id;
            setCurrentChatId(chatId);
            console.log("Chat created successfully with ID:", chatId);
          } else {
            throw new Error(
              createChatResponse.error || "Failed to create chat"
            );
          }
        }

        if (!chatId) {
          throw new Error("Chat ID is required");
        }

        console.log("Sending message to chatbot:", { chatId, messageText });
        const botResponse = await chatServices.sendMessageToChatBot(
          chatId,
          messageText
        );

        if (botResponse.success) {
          const botMessage = {
            id: messages.length + 2,
            text:
              botResponse.botResponse ||
              botResponse.data?.reply ||
              "Xin lỗi, tôi không thể trả lời lúc này.",
            isBot: true,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        } else {
          throw new Error(botResponse.error || "Failed to get bot response");
        }
      } catch (error) {
        console.error("Error in handleSendMessage:", error);

        const errorMessage = {
          id: messages.length + 2,
          text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
          isBot: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div
            className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 ${
              notification.type === "success"
                ? "bg-white border-green-500"
                : notification.type === "error"
                ? "bg-white border-red-500"
                : "bg-white border-blue-500"
            } max-w-md`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : notification.type === "error" ? (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${
                  notification.type === "success"
                    ? "text-green-800"
                    : notification.type === "error"
                    ? "text-red-800"
                    : "text-blue-800"
                }`}
              >
                {notification.type === "success"
                  ? "Thành công!"
                  : notification.type === "error"
                  ? "Lỗi!"
                  : "Thông báo"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() =>
                setNotification({ show: false, type: "success", message: "" })
              }
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {confirmDialog.title}
              </h3>
            </div>

            <p className="text-gray-600 mb-6 ml-16">{confirmDialog.message}</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setConfirmDialog({
                    show: false,
                    title: "",
                    message: "",
                    onConfirm: () => {},
                  })
                }
                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog({
                    show: false,
                    title: "",
                    message: "",
                    onConfirm: () => {},
                  });
                }}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Icon - Fixed position in bottom right corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChatPopup(true)}
          className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 relative cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            2
          </div>
        </button>
      </div>

      {/* Chat Popup */}
      {showChatPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          {!showChatHistory ? (
            // Main Chat Window
            <div className="bg-white rounded-lg shadow-xl w-90 h-120 flex flex-col animate-slide-up">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-3 rounded-t-lg flex items-center justify-between">
                <button
                  onClick={handleShowChatHistory}
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer mr-2"
                  title="Lịch sử chat"
                >
                  <Logs />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">Travel AI</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatPopup(false)}
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-2 ${
                        message.isBot ? "" : "justify-end"
                      }`}
                    >
                      {message.isBot && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-3 shadow-sm max-w-xs ${
                          message.isBot
                            ? "bg-white text-gray-700"
                            : "bg-blue-500 text-white ml-auto"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
                      </div>
                      {!message.isBot && (
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input area */}
              <div className="p-2 bg-white rounded-b-lg">
                <div className="flex items-end space-x-2">
                  <textarea
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      e.target.style.height = "auto";
                      const maxHeight = 120;
                      if (e.target.scrollHeight > maxHeight) {
                        e.target.style.height = maxHeight + "px";
                        e.target.style.overflowY = "auto";
                      } else {
                        e.target.style.height = e.target.scrollHeight + "px";
                        e.target.style.overflowY = "hidden";
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    rows={1}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm resize-none break-words focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ minHeight: "40px", maxHeight: "100px" }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`rounded-full p-3 transition-colors ${
                      newMessage.trim()
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Forward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Chat History View
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg shadow-xl w-90 h-120 flex flex-col">
              {/* Header */}
              <div className="p-3 rounded-t-lg flex items-center justify-between border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xl">
                      Travel AI
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white">
                      Danh sách hội thoại
                    </h4>
                    <span className="text-xs text-white/70 bg-white/20 px-3 py-1 rounded-full">
                      {chatHistory.length} cuộc trò chuyện
                    </span>
                  </div>

                  {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <MessageSquareDashed className="w-8 h-8 text-white/60" />
                      </div>
                      <p className="text-white/80 text-sm text-center">
                        Chưa có hội thoại nào
                      </p>
                      <p className="text-white/60 text-xs text-center mt-1">
                        Bắt đầu trò chuyện mới với Travel AI
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatHistory.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => handleSelectChat(chat.id)}
                          className="bg-white backdrop-blur-sm rounded-xl p-2 hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                                  {chat.title || "Cuộc trò chuyện"}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-3.5 h-3.5 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      chat.created_at
                                    ).toLocaleDateString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                              title="Xóa cuộc trò chuyện"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-white/10 rounded-b-lg">
                <button
                  onClick={() => {
                    setCurrentChatId(null);
                    setMessages([
                      {
                        id: 1,
                        text: "Xin Chào Quý Khách! Travel AI sẵn sàng hỗ trợ ạ.",
                        isBot: true,
                        timestamp: new Date(),
                      },
                      {
                        id: 2,
                        text: "Em là nhân viên Travel AI xin được hỗ trợ Quý Anh/Chị ạ.",
                        isBot: true,
                        timestamp: new Date(),
                      },
                    ]);
                    setShowChatHistory(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all cursor-pointer"
                >
                  Tạo cuộc trò chuyện mới
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

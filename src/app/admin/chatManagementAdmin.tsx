"use client";

import { useState, useEffect, useRef } from "react";
import { adminServices } from "@/services/adminServices";
import { User } from "lucide-react";

export default function ChatManagementAdminComponent() {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [followUpStatusLoading, setFollowUpStatusLoading] = useState(true);

  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const showNotification = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type, message: "" });
    }, 3000);
  };

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all chats on component mount
  useEffect(() => {
    fetchAllChats();
    fetchFollowUpStatus();
  }, []);

  const fetchAllChats = async () => {
    try {
      setLoading(true);
      const response = await adminServices.getAllChats();

      if (response.success) {
        const sortedChats = response.data.sort((a: any, b: any) => {
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        });
        setChats(sortedChats);
      } else {
        showNotification("error", "Không thể tải danh sách chat");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      showNotification("error", "Có lỗi xảy ra khi tải chat");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowUpStatus = async () => {
    try {
      setFollowUpStatusLoading(true);
      const response = await adminServices.getFollowUpStatus();

      if (response.success) {
        setFollowUpEnabled(response.isEnabled);
      }
    } catch (error) {
      console.error("Error fetching follow-up status:", error);
    } finally {
      setFollowUpStatusLoading(false);
    }
  };

  const handleToggleFollowUp = async () => {
    try {
      setLoadingFollowUp(true);
      const action = followUpEnabled ? "disable" : "enable";

      const response = await adminServices.toggleFollowUp(action);

      if (response.success) {
        setFollowUpEnabled(!followUpEnabled);
        showNotification(
          action === "disable" ? "warning" : "success",
          response.message ||
            `Follow-up ${
              action === "enable" ? "đã được bật" : "đã được tắt"
            } thành công!`
        );
      } else {
        showNotification(
          "error",
          response.error ||
            `Không thể ${action === "enable" ? "bật" : "tắt"} follow-up`
        );
      }
    } catch (error) {
      console.error("Error toggling follow-up:", error);
      showNotification(
        "error",
        "Có lỗi xảy ra khi thay đổi trạng thái follow-up"
      );
    } finally {
      setLoadingFollowUp(false);
    }
  };

  const handleSelectChat = async (chat: any) => {
    setSelectedChat(chat);
    setLoadingMessages(true);

    try {
      const response = await adminServices.getChatMessages(chat.id);

      if (response.success) {
        setMessages(response.data);
      } else {
        showNotification("error", "Không thể tải tin nhắn");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      showNotification("error", "Có lỗi xảy ra khi tải tin nhắn");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSendingMessage(true);
      const response = await adminServices.sendAdminMessage(
        selectedChat.id,
        newMessage
      );

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            content: newMessage,
            sender: "admin",
            timestamp: new Date().toISOString(),
          },
        ]);
        setNewMessage("");
        showNotification("success", "Tin nhắn đã được gửi");
      } else {
        showNotification("error", response.error || "Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("error", "Có lỗi xảy ra khi gửi tin nhắn");
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border-l-4 ${
              notification.type === "success"
                ? "bg-white border-green-500"
                : notification.type === "warning"
                ? "bg-white border-red-500"
                : "bg-white border-red-500"
            } max-w-md`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-500"
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
              ) : (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-500"
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
                </div>
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : notification.type === "warning"
                    ? "text-red-800"
                    : "text-red-800"
                }`}
              >
                {notification.type === "success"
                  ? "Thành công!"
                  : notification.type === "warning"
                  ? "Thành công!"
                  : "Lỗi!"}
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

      {/* Chat List Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>
            <button
              onClick={handleToggleFollowUp}
              disabled={loadingFollowUp || followUpStatusLoading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                followUpEnabled
                  ? "bg-green-100 text-green-800 hover:bg-green-200 shadow-sm hover:shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm hover:shadow-md"
              } ${
                loadingFollowUp || followUpStatusLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {loadingFollowUp ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  <div
                    className={`w-3 h-3 rounded-xl ${
                      followUpEnabled ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span>Follow-up</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg
                className="w-16 h-16 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectChat(chat);
                  }}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {chat.user_email?.[0]?.toUpperCase() || <User />}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.title || "Untitled Chat"}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(chat.updated_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {chat.user_id || chat.platform || "Anonymous"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg font-medium mb-1">
                Chọn một cuộc trò chuyện
              </p>
              <p className="text-sm">
                Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {selectedChat.user_email?.[0]?.toUpperCase() || <User />}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedChat.title || "Untitled Chat"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedChat.user_id ||
                      selectedChat.platform ||
                      "Anonymous"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Chưa có tin nhắn</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isUser ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-md px-4 py-2 rounded-lg ${
                          isUser
                            ? "bg-gray-200 text-gray-900"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isUser ? "text-gray-500" : "text-blue-100"
                          }`}
                        >
                          {new Date(
                            message.created_at || message.timestamp
                          ).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 px-6 py-4 pb-6">
              <div className="flex items-end space-x-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  rows={1}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ minHeight: "40px", maxHeight: "120px" }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newMessage.trim() && !sendingMessage
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {sendingMessage ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

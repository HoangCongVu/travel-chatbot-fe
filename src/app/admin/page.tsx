"use client";

import { useState, useEffect, useRef } from "react";
import CreateTourPopup from "./createTour";
import { useRouter } from "next/navigation";
import { adminServices, tokenManager } from "@/services/adminServices";
import TourAdminComponent from "./tourAdmin";
import DocumentAdminComponent from "./documentAdmin";
import UserManagementAdminComponent from "./userManagementAdmin";
import { User } from "lucide-react";

type TabType = "users" | "chats" | "settings" | "documents" | "tours";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status using token from cookies via tokenManager
    const checkAuth = () => {
      const token = tokenManager.getToken();
      setLoading(false);

      if (!token) {
        router.push("admin/login");
      } else {
        // Successfully authenticated, ensure default tab is set
        console.log("✅ Admin authenticated, showing admin panel");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    // Use adminServices logout to properly clean up
    adminServices.logout();
    // Set logout success flag for login page to show notification
    localStorage.setItem("admin_logout_success", "true");
    router.push("admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-4xl font-bold flex items-center gap-2">
                <span className="text-blue-500">TravelAI</span>
                <span className="text-gray-700">Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xl text-gray-500">Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "users"
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                User Management
              </button>

              <button
                onClick={() => setActiveTab("chats")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "chats"
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Chat Management
              </button>

              <button
                onClick={() => setActiveTab("tours")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "tours"
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Tours
              </button>

              <button
                onClick={() => setActiveTab("documents")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "documents"
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Documents
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow min-h-full">
            {activeTab === "users" && <UserManagementAdminComponent />}
            {activeTab === "chats" && <ChatManagement />}
            {activeTab === "settings" && <Settings />}
            {activeTab === "documents" && <DocumentAdminComponent />}
            {activeTab === "tours" && <TourAdminComponent />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat Management Component
function ChatManagement() {
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
        // Sort chats by updated_at, newest first
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
        // Add message to UI immediately
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
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>
            <button
              onClick={handleToggleFollowUp}
              disabled={loadingFollowUp || followUpStatusLoading}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                followUpEnabled
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${
                loadingFollowUp || followUpStatusLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {loadingFollowUp ? (
                <span>...</span>
              ) : (
                <>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      followUpEnabled ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span>Follow-up</span>
                </>
              )}
            </button>
          </div>

          {/* Search */}
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

        {/* Chat List */}
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
                        {chat.user_email?.[0]?.toUpperCase() || (
                          <User className="" />
                        )}
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
            {/* Chat Header */}
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

            {/* Messages */}
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
                  const isAssistantOrAdmin =
                    message.role === "assistant" ||
                    message.role === "admin" ||
                    message.sender === "admin";

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

            {/* Message Input */}
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

// Settings Component
function Settings() {
  const [followUpConfig, setFollowUpConfig] = useState({
    delay_minutes: 0,
    max_count: 0,
    active_hours_start: 0,
    active_hours_end: 0,
    scan_interval_minutes: 0,
  });

  const [currentStatus, setCurrentStatus] = useState({
    is_enabled: false,
    delay_minutes: 0,
    max_count: 0,
    active_hours: "",
    scan_interval_minutes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type, message: "" });
    }, 3000);
  };

  useEffect(() => {
    fetchFollowUpStatus();
  }, []);

  const fetchFollowUpStatus = async () => {
    try {
      setLoading(true);
      const response = await adminServices.getFollowUpStatus();

      if (response.success && response.data) {
        const data = response.data;
        setCurrentStatus({
          is_enabled: data.is_enabled || false,
          delay_minutes: data.delay_minutes || 0,
          max_count: data.max_count || 0,
          active_hours: data.active_hours || "",
          scan_interval_minutes: data.scan_interval_minutes || 0,
        });

        // Parse active_hours to extract start and end
        if (data.active_hours) {
          const match = data.active_hours.match(/(\d+)h\s*-\s*(\d+)h/);
          if (match) {
            setFollowUpConfig({
              delay_minutes: data.delay_minutes || 0,
              max_count: data.max_count || 0,
              active_hours_start: parseInt(match[1]),
              active_hours_end: parseInt(match[2]),
              scan_interval_minutes: data.scan_interval_minutes || 0,
            });
          }
        } else {
          setFollowUpConfig({
            delay_minutes: data.delay_minutes || 0,
            max_count: data.max_count || 0,
            active_hours_start: 0,
            active_hours_end: 0,
            scan_interval_minutes: data.scan_interval_minutes || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching follow-up status:", error);
      showNotification("error", "Không thể tải cấu hình follow-up");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: string, value: number) => {
    setFollowUpConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);

      // Validate inputs
      if (
        followUpConfig.delay_minutes < 0 ||
        followUpConfig.max_count < 0 ||
        followUpConfig.active_hours_start < 0 ||
        followUpConfig.active_hours_start > 23 ||
        followUpConfig.active_hours_end < 0 ||
        followUpConfig.active_hours_end > 23 ||
        followUpConfig.scan_interval_minutes < 0
      ) {
        showNotification("error", "Vui lòng nhập giá trị hợp lệ");
        return;
      }

      if (
        followUpConfig.active_hours_start >= followUpConfig.active_hours_end
      ) {
        showNotification("error", "Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
        return;
      }

      const response = await adminServices.updateFollowUpConfig(followUpConfig);

      if (response.success) {
        showNotification("success", "Cập nhật cấu hình thành công!");
        // Refresh status
        await fetchFollowUpStatus();
      } else {
        showNotification(
          "error",
          response.error || "Không thể cập nhật cấu hình"
        );
      }
    } catch (error) {
      console.error("Error saving config:", error);
      showNotification("error", "Có lỗi xảy ra khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div
            className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 ${
              notification.type === "success"
                ? "bg-white border-green-500"
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
                className={`text-sm font-semibold ${
                  notification.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {notification.type === "success" ? "Thành công!" : "Lỗi!"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Chatbot Settings
        </h2>
        <p className="text-gray-600">
          Cấu hình tính năng follow-up tự động cho chatbot
        </p>
      </div>

      {/* Current Status Card */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Trạng thái hiện tại
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
            <p className="text-lg font-semibold">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  currentStatus.is_enabled
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {currentStatus.is_enabled ? "Đang bật" : "Đang tắt"}
              </span>
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Thời gian chờ</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentStatus.delay_minutes} phút
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Số lần tối đa</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentStatus.max_count} lần
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Giờ hoạt động</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentStatus.active_hours || "Chưa cấu hình"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Khoảng thời gian quét</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentStatus.scan_interval_minutes} phút
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Cập nhật cấu hình
        </h3>

        <div className="space-y-6 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian chờ (phút)
                <span className="text-gray-500 text-xs ml-2">
                  (Thời gian chờ trước khi gửi follow-up)
                </span>
              </label>
              <input
                type="number"
                min="0"
                value={followUpConfig.delay_minutes}
                onChange={(e) =>
                  handleConfigChange(
                    "delay_minutes",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lần follow-up tối đa
                <span className="text-gray-500 text-xs ml-2">
                  (Số lần gửi tối đa cho mỗi người dùng)
                </span>
              </label>
              <input
                type="number"
                min="0"
                value={followUpConfig.max_count}
                onChange={(e) =>
                  handleConfigChange("max_count", parseInt(e.target.value) || 0)
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ bắt đầu hoạt động
                <span className="text-gray-500 text-xs ml-2">(0-23)</span>
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={followUpConfig.active_hours_start}
                onChange={(e) =>
                  handleConfigChange(
                    "active_hours_start",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ kết thúc hoạt động
                <span className="text-gray-500 text-xs ml-2">(0-23)</span>
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={followUpConfig.active_hours_end}
                onChange={(e) =>
                  handleConfigChange(
                    "active_hours_end",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 23"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng thời gian quét (phút)
                <span className="text-gray-500 text-xs ml-2">
                  (Thời gian giữa các lần quét hệ thống)
                </span>
              </label>
              <input
                type="number"
                min="0"
                value={followUpConfig.scan_interval_minutes}
                onChange={(e) =>
                  handleConfigChange(
                    "scan_interval_minutes",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 2"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white flex items-center`}
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Lưu cấu hình
                </>
              )}
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Cấu hình sẽ được áp dụng ngay sau khi lưu thành công</li>
                  <li>Giờ hoạt động được tính theo múi giờ hệ thống</li>
                  <li>Các giá trị phải lớn hơn hoặc bằng 0</li>
                  <li>Giờ bắt đầu phải nhỏ hơn giờ kết thúc</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

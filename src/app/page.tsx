"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LoginPopup from "@/components/LoginPopup";
import RegisterPopup from "@/components/RegisterPopup";
import UserDropdown from "@/components/UserDropdown";
import { tourServices } from "@/services/tourServices";
import { userTokenManager } from "@/services/authServices";
import { chatServices } from "@/services/chatServices";
import {
  Bot,
  Forward,
  Logs,
  MessageCircleCode,
  MessageSquareDashed,
  Plus,
  User,
} from "lucide-react";

// Define tour type based on actual API structure
interface Tour {
  tour_id?: string;
  tour_name: string;
  tour_type_id?: number;
  days: number;
  description: string;
  highlight: string;
  itinerary_url: string;
  image_url: string;
  promotion_info: string;
  price_type: string;
  departures: string[];
  destinations: string[];
  departure_schedules: Array<{
    schedule_type: string;
    specific_dates?: string[];
    recurrence_type?: string;
    start_date?: string;
    end_date?: string;
    weekdays?: number[];
  }>;
  visa_prices: any[];
  price_by_packages: Array<{ package_name: string; price: number }>;
  price_by_dates: Array<{ date: string; price: number }>;
}

export default function Home() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    destination: "",
    departure: "Hồ Chí Minh",
    departureDate: "",
  });

  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const toursPerPage = 10;
  const [messages, setMessages] = useState([
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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
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

  // Helper function to show notification
  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type, message: "" });
    }, 3000);
  };

  // Helper function to show confirm dialog
  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };

  // Handle token expiration
  const handleTokenExpired = () => {
    userTokenManager.removeToken();
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserEmail("");
    setShowChatPopup(false);
    setShowChatHistory(false);
    showNotification(
      "error",
      "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
    );
    setTimeout(() => {
      setShowLoginPopup(true);
    }, 500);
  };

  // Check authentication status on component mount
  useEffect(() => {
    const token = userTokenManager.getToken();
    const email = localStorage.getItem("userEmail"); // Keep email in localStorage for now
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  // Fetch tours from API
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        console.log(
          `🔍 Fetching page ${currentPage} with limit ${toursPerPage}`
        );

        const response = await tourServices.fetchAllTours(
          currentPage,
          toursPerPage
        );
        console.log("📥 API Response:", response);

        // Handle the actual API structure: response.data.tours
        let toursData = response?.data?.tours || response?.tours || [];
        console.log(`📊 Tours received: ${toursData.length} tours`);

        // If backend doesn't handle pagination properly, do it on frontend
        const totalToursFromAPI = toursData.length;
        const totalResults =
          response?.total_results ||
          response?.data?.total_results ||
          totalToursFromAPI;

        // Sort tours by creation date (newest first) if available
        if (toursData.length > 0) {
          toursData = toursData.sort((a: any, b: any) => {
            // Assuming tours have a created_at or similar field
            const dateA = new Date(a.created_at || a.tour_id || 0);
            const dateB = new Date(b.created_at || b.tour_id || 0);
            return dateB.getTime() - dateA.getTime(); // Newest first
          });

          // If API returns all tours, slice to show only current page
          if (totalToursFromAPI > toursPerPage) {
            const startIndex = (currentPage - 1) * toursPerPage;
            const endIndex = startIndex + toursPerPage;
            toursData = toursData.slice(startIndex, endIndex);
            console.log(
              `✂️ Sliced to show tours ${startIndex + 1}-${Math.min(
                endIndex,
                totalToursFromAPI
              )}`
            );
          }
        }

        console.log(`📋 Final tours to display: ${toursData.length} tours`);
        console.log(`🎯 Total results: ${totalResults}`);

        setTours(toursData);
        setTotalTours(totalResults);
      } catch (err) {
        setError("Không thể tải danh sách tour. Vui lòng thử lại sau.");
        console.error("Error fetching tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [currentPage, toursPerPage]);

  const handleLogout = () => {
    userTokenManager.removeToken(); // Remove token from cookie
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserEmail("");
  };

  // Handle tour type search
  const handleTourTypeSearch = async (tourTypeId: number) => {
    try {
      setLoading(true);
      console.log(`🔍 Searching tours by type: ${tourTypeId}`);

      const response = await tourServices.fetchToursByType(
        tourTypeId,
        1,
        toursPerPage
      );
      console.log("📥 Tour Type API Response:", response);

      // Handle the actual API structure: response.data.tours
      let toursData = response?.data?.tours || response?.tours || [];
      console.log(`📊 Tours by type received: ${toursData.length} tours`);

      const totalResults =
        response?.total_results ||
        response?.data?.total_results ||
        toursData.length;

      // Sort tours by creation date (newest first) if available
      if (toursData.length > 0) {
        toursData = toursData.sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || a.tour_id || 0);
          const dateB = new Date(b.created_at || b.tour_id || 0);
          return dateB.getTime() - dateA.getTime();
        });
      }

      console.log(
        `📋 Final tours by type to display: ${toursData.length} tours`
      );
      console.log(`🎯 Total results: ${totalResults}`);

      setTours(toursData);
      setTotalTours(totalResults);
      setCurrentPage(1); // Reset to first page when filtering
    } catch (err) {
      setError("Không thể tải danh sách tour theo loại. Vui lòng thử lại sau.");
      console.error("Error fetching tours by type:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle navigate to tour detail page
  const handleViewTourDetail = (tourId: string) => {
    console.log("🚀 Navigating to tour:", tourId);
    router.push(`/tour/${tourId}`);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const messageText = newMessage.trim();

      // Add user message to UI immediately
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

        // If no chat exists, create one with the first message as title
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

        // Send message to chatbot
        if (!chatId) {
          throw new Error("Chat ID is required");
        }

        console.log("Sending message to chatbot:", { chatId, messageText });
        const botResponse = await chatServices.sendMessageToChatBot(
          chatId,
          messageText
        );

        if (botResponse.success) {
          // Add bot response to messages
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

        // Add error message as bot response
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
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleOpenChatPopup = () => {
    setShowChatPopup(true);
  };

  const handleShowChatHistory = async () => {
    if (!isLoggedIn) {
      showNotification("info", "Vui lòng đăng nhập để xem lịch sử chat");
      return;
    }

    try {
      const response = await chatServices.getUserChats("");
      if (response.success) {
        setChatHistory(response.chats);
        setShowChatHistory(true);
      } else if (
        response.error &&
        (response.error.includes("Token expired") ||
          response.error.includes("expired"))
      ) {
        handleTokenExpired();
      } else {
        showNotification("error", "Không thể tải lịch sử chat");
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
        // Transform messages to match UI format
        const transformedMessages = response.messages.map(
          (msg: any, index: number) => ({
            id: index + 1,
            text: msg.content || msg.text,
            isBot:
              msg.sender === "bot" ||
              msg.sender === "system" ||
              msg.role === "assistant",
            timestamp: new Date(msg.created_at || msg.timestamp),
          })
        );
        setMessages(transformedMessages);
      } else if (
        response.error &&
        (response.error.includes("Token expired") ||
          response.error.includes("expired"))
      ) {
        handleTokenExpired();
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
            handleTokenExpired();
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

  return (
    <div className="min-h-screen bg-white">
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
              ) : notification.type === "error" ? (
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
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-500"
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
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-4xl font-bold">
                <span className="text-blue-500">Travel</span>
                <span className="text-gray-700">AI</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a
                href="#"
                className="text-gray-700 hover:text-blue-400 font-medium"
              >
                DU LỊCH
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-400 font-medium"
              >
                VÉ MÁY BAY
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-400 font-medium"
              >
                KHÁCH SẠN
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-400 font-medium"
              >
                DỊCH VỤ LÀM VISA
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-400 font-medium"
              >
                THUÊ XE
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-400 font-medium"
              >
                TIN TỨC
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-400 font-medium"
              >
                GIỚI THIỆU
              </a>{" "}
              <div className="flex items-center space-x-6">
                {isLoggedIn ? (
                  <UserDropdown userEmail={userEmail} onLogout={handleLogout} />
                ) : (
                  <button
                    onClick={() => setShowLoginPopup(true)}
                    className="flex items-center text-gray-700 space-x-1 hover:text-blue-400 cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Tài khoản</span>
                  </button>
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <button className="lg:hidden">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative min-h-96">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://res.cloudinary.com/dq1mvlfoo/image/upload/v1760082548/h1.jpg.jpg)",
          }}
        ></div>

        {/* <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                CHẠM ĐẾN SẮC THU
              </div>
              <div className="text-6xl font-bold text-red-500 drop-shadow-lg">
                CHÂU Á
              </div>
              <div className="text-2xl text-white italic mt-2 drop-shadow-lg">
                Chăm Tour Đặc Biệt
              </div>
            </div>

            <div className="mb-4">
              <span className="bg-red-600 text-white px-3 py-1 rounded">
                Mua 1 Tặng 3
              </span>
              <div className="text-lg text-white mt-2 drop-shadow">
                Giảm Giá lên Đến 1.000.000đ
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-white mb-2 drop-shadow">
                Giá chỉ từ
              </div>
              <div className="text-6xl font-bold text-red-500 drop-shadow-lg">
                12.499.000đ
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-white drop-shadow">
                Tổng đài: <span className="font-semibold">0911006880</span> |{" "}
                <span className="ml-2">travelAi.com</span> |{" "}
                <span className="ml-2">liên hệ: 0911 006 880</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Service Categories */}
      <div className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <div
              onClick={() => handleTourTypeSearch(1)}
              className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
            >
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium">Tour TRONG NƯỚC</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(2)}
              className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="text-sm font-medium">Tour NƯỚC NGOÀI</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(3)}
              className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium">Tour TRONG NGÀY</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(4)}
              className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2v1a2 2 0 002 2h8a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium">COMBO DU LỊCH</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(5)}
              className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div className="text-sm font-medium">TEAM BUILDING</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(6)}
              className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <div className="text-sm font-medium">MICE</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(7)}
              className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
            >
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="text-sm font-medium">FREE & EASY</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tour Listings */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Đang tải tour...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="space-y-6">
                  {tours.map((tour, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-55"
                    >
                      <div className="flex h-full">
                        <div className="w-68 h-full bg-gray-200 flex-shrink-0">
                          {tour.image_url &&
                          tour.image_url.startsWith("http") &&
                          !tour.image_url.includes("string") &&
                          !tour.image_url.includes("KHÔNG CÓ ẢNH") ? (
                            <img
                              src={tour.image_url}
                              alt={tour.tour_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-sm">
                                Tour Image
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                              {tour.tour_name}
                            </h3>

                            <div className="grid grid-cols-2 gap-3 mb-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <span className="mr-2">🏷️</span>
                                <span>
                                  Thời gian: <strong>{tour.days} ngày</strong>
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">📍</span>
                                <span className="truncate">
                                  Khởi hành:{" "}
                                  <strong>
                                    {tour.departures.join(", ") || "Nhiều điểm"}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">🎯</span>
                                <span className="truncate">
                                  Điểm đến:{" "}
                                  <strong>
                                    {tour.destinations.join(", ") || "Đa dạng"}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">💰</span>
                                <span>
                                  Loại giá: <strong>{tour.price_type}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-gray-500">
                                Giá từ:
                              </div>
                              <div className="text-xl font-bold text-red-600">
                                {(() => {
                                  if (
                                    tour.price_by_packages &&
                                    tour.price_by_packages.length > 0
                                  ) {
                                    return `${tour.price_by_packages[0].price.toLocaleString(
                                      "vi-VN"
                                    )} đ`;
                                  } else if (
                                    tour.price_by_dates &&
                                    tour.price_by_dates.length > 0
                                  ) {
                                    return `${tour.price_by_dates[0].price.toLocaleString(
                                      "vi-VN"
                                    )} đ`;
                                  } else {
                                    return "Liên hệ";
                                  }
                                })()}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleViewTourDetail(
                                  tour.tour_id || "sample-tour-id"
                                );
                              }}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalTours > toursPerPage && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        Trước
                      </button>

                      {/* Page Numbers */}
                      {(() => {
                        const totalPages = Math.ceil(totalTours / toursPerPage);
                        const pageNumbers = [];
                        const maxVisiblePages = 5;

                        let startPage = Math.max(
                          1,
                          currentPage - Math.floor(maxVisiblePages / 2)
                        );
                        let endPage = Math.min(
                          totalPages,
                          startPage + maxVisiblePages - 1
                        );

                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(
                            1,
                            endPage - maxVisiblePages + 1
                          );
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-3 py-2 rounded-md text-sm font-medium ${
                                currentPage === i
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        return pageNumbers;
                      })()}

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={
                          currentPage >= Math.ceil(totalTours / toursPerPage)
                        }
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage >= Math.ceil(totalTours / toursPerPage)
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}

                {/* Page Info */}
                {totalTours > 0 && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Hiển thị{" "}
                    {Math.min((currentPage - 1) * toursPerPage + 1, totalTours)}{" "}
                    - {Math.min(currentPage * toursPerPage, totalTours)} trong
                    tổng số {totalTours} tour
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-100">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-600">
                LỌC TOUR THEO
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bạn muốn đến đâu?
                  </label>
                  <input
                    type="text"
                    placeholder="Bạn muốn đến đâu?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchData.destination}
                    onChange={(e) =>
                      handleInputChange("destination", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nơi khởi hành
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchData.departure}
                    onChange={(e) =>
                      handleInputChange("departure", e.target.value)
                    }
                  >
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày khởi hành
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchData.departureDate}
                    onChange={(e) =>
                      handleInputChange("departureDate", e.target.value)
                    }
                  />
                </div>

                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-medium">
                  Tìm kiếm
                </button>
              </div>
            </div>

            <div className="bg-blue-500 text-white rounded-lg p-6 text-center">
              <h3 className="text-lg font-bold mb-2">
                KHÁCH ĐOÀN TỔ CHỨC TOUR RIÊNG
              </h3>
              <p className="text-sm mb-4">VUI LÒNG LIÊN HỆ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onSwitchToRegister={() => {
          setShowLoginPopup(false);
          setShowRegisterPopup(true);
        }}
      />

      {/* Register Popup */}
      <RegisterPopup
        isOpen={showRegisterPopup}
        onClose={() => setShowRegisterPopup(false)}
        onSwitchToLogin={() => {
          setShowRegisterPopup(false);
          setShowLoginPopup(true);
        }}
      />

      {/* Chat Icon - Fixed position in bottom right corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleOpenChatPopup}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 relative cursor-pointer"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
          </svg>
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
              <div className="bg-blue-500 text-white p-3 rounded-t-lg flex items-center justify-between">
                <button
                  onClick={handleShowChatHistory}
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer mr-2"
                  title="Lịch sử chat"
                >
                  <Logs />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <MessageSquareDashed className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold ">Travel AI</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatPopup(false)}
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer"
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
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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

                      // reset chiều cao để tính scrollHeight chính xác
                      e.target.style.height = "auto";

                      // set chiều cao tối đa maxHeight
                      const maxHeight = 120; // px
                      if (e.target.scrollHeight > maxHeight) {
                        e.target.style.height = maxHeight + "px";
                        e.target.style.overflowY = "auto"; // bật scroll
                      } else {
                        e.target.style.height = e.target.scrollHeight + "px";
                        e.target.style.overflowY = "hidden"; // ẩn scroll
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
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
                    <Forward className="w-4 h-4 " />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Chat History View
            <div className="bg-blue-500 rounded-lg shadow-xl w-90 h-120 flex flex-col">
              {/* Header */}
              <div className="p-3 rounded-t-lg flex items-center justify-between border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <MessageSquareDashed className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Travel AI</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors cursor-pointer"
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

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto p-4 bg-white/10">
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Danh sách hội thoại
                  </h4>
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>Chưa có lịch sử chat</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((chat) => {
                        const createdDate = new Date(chat.created_at);
                        const now = new Date();
                        const diffTime = Math.abs(
                          now.getTime() - createdDate.getTime()
                        );
                        const diffMinutes = Math.floor(diffTime / (1000 * 60));
                        const diffHours = Math.floor(
                          diffTime / (1000 * 60 * 60)
                        );
                        const diffDays = Math.floor(
                          diffTime / (1000 * 60 * 60 * 24)
                        );

                        let timeText = "";
                        if (diffMinutes < 60) {
                          timeText =
                            diffMinutes === 0
                              ? "vừa xong"
                              : `${diffMinutes} phút`;
                        } else if (diffHours < 24) {
                          timeText = `${diffHours} giờ`;
                        } else {
                          timeText = `${diffDays} ngày`;
                        }

                        return (
                          <div
                            key={chat.id}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                          >
                            <div
                              onClick={() => handleSelectChat(chat.id)}
                              className="flex items-start space-x-3 flex-1 min-w-0"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <MessageSquareDashed className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-gray-900 truncate">
                                    Travel AI Chat
                                  </h5>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {timeText}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate mt-0.5">
                                  {chat.title || "Gửi cho bạn một tin nhắn"}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-700"
                              title="Xóa chat"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-white/10 rounded-b-lg">
                <button
                  onClick={() => {
                    setShowChatHistory(false);
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
                  }}
                  className="w-full bg-white text-blue-600 py-2.5 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="leading-none">Tạo hội thoại mới</span>
                  <Plus className="w-4 h-4 leading-none" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

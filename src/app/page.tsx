"use client";

import { useState, useEffect, useRef } from "react";
import LoginPopup from "@/components/LoginPopup";
import RegisterPopup from "@/components/RegisterPopup";
import UserDropdown from "@/components/UserDropdown";
import { tourServices } from "@/services/tourServices";

// Define tour type based on actual API structure
interface Tour {
  tour_name: string;
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
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin Chào Quý Khách! Travel AI sẵn sàng hỗ trợ ạ.",
      isBot: true,
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "Em là nhân viên DLV xin được hỗ trợ Quý Anh/Chị ạ",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check authentication status on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    const email = localStorage.getItem("userEmail");
    if (authStatus === "true" && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  // Fetch tours from API
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await tourServices.fetchAllTours(1, 10);
        console.log("API Response:", response);
        // Handle the actual API structure: response.data.tours
        const toursData = response?.data?.tours || response?.tours || [];
        setTours(toursData);
      } catch (err) {
        setError("Không thể tải danh sách tour. Vui lòng thử lại sau.");
        console.error("Error fetching tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserEmail("");
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add user message
      const userMessage = {
        id: messages.length + 1,
        text: newMessage,
        isBot: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");

      // Simulate bot response after a short delay
      setTimeout(() => {
        const botResponses = [
          "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ hỗ trợ bạn ngay.",
          "Bạn muốn tìm hiểu về tour nào ạ?",
          "Chúng tôi có nhiều tour hấp dẫn, bạn có thể xem danh sách trên trang chủ.",
          "Để được tư vấn chi tiết, bạn vui lòng để lại số điện thoại nhé!",
          "Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.",
        ];

        const randomResponse =
          botResponses[Math.floor(Math.random() * botResponses.length)];

        const botMessage = {
          id: messages.length + 2,
          text: randomResponse,
          isBot: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold">
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
                    className="flex items-center text-gray-700 space-x-1 hover:text-blue-400"
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

        <div className="relative max-w-7xl mx-auto px-4 py-16">
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
        </div>
      </div>

      {/* Service Categories */}
      <div className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-medium">Tour TRONG NƯỚC</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-medium">Tour NƯỚC NGOÀI</div>
            </div>

            {/* <div className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-medium">Dịch vụ làm VISA</div>
            </div> */}

            {/* <div className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-medium">VÉ MÁY BAY GIÁ RẺ</div>
            </div> */}

            <div className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-medium">ĐẶT KHÁCH SAN</div>
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
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="flex">
                        <div className="w-64 h-48 bg-gray-200 flex-shrink-0">
                          {tour.image_url ? (
                            <img
                              src={tour.image_url}
                              alt={tour.tour_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-300 to-red-300 flex items-center justify-center">
                              <span className="text-white text-sm">
                                Tour Image
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {tour.tour_name}
                          </h3>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="mr-2">🏷️</span>
                              <span>
                                Thời gian: <strong>{tour.days} ngày</strong>
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">📍</span>
                              <span>
                                Khởi hành:{" "}
                                <strong>
                                  {tour.departures.join(", ") || "Nhiều điểm"}
                                </strong>
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">🎯</span>
                              <span>
                                Điểm đến:{" "}
                                <strong>
                                  {tour.destinations.join(", ") || "Đa dạng"}
                                </strong>
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">�</span>
                              <span>
                                Loại giá: <strong>{tour.price_type}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Show departure schedules */}
                          {tour.departure_schedules &&
                            tour.departure_schedules.length > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center mb-2">
                                  <span className="text-sm text-gray-600 mr-2">
                                    🗓️ Lịch khởi hành:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {tour.departure_schedules.map(
                                    (schedule, scheduleIndex) => {
                                      if (
                                        schedule.schedule_type === "specific" &&
                                        schedule.specific_dates
                                      ) {
                                        return schedule.specific_dates.map(
                                          (date: string, dateIndex: number) => (
                                            <span
                                              key={`${scheduleIndex}-${dateIndex}`}
                                              className="px-3 py-1 border border-blue-300 rounded text-sm text-blue-600"
                                            >
                                              {new Date(
                                                date
                                              ).toLocaleDateString("vi-VN")}
                                            </span>
                                          )
                                        );
                                      } else if (
                                        schedule.schedule_type === "recurring"
                                      ) {
                                        return (
                                          <span
                                            key={scheduleIndex}
                                            className="px-3 py-1 border border-blue-300 rounded text-sm text-blue-600"
                                          >
                                            {schedule.recurrence_type ===
                                            "daily"
                                              ? "Hàng ngày"
                                              : schedule.recurrence_type ===
                                                "weekly"
                                              ? "Hàng tuần"
                                              : "Định kỳ"}
                                          </span>
                                        );
                                      }
                                      return null;
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-gray-500">
                                Giá từ:
                              </div>
                              <div className="text-2xl font-bold text-red-600">
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
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium">
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
              <p className="text-sm mb-4">VUI LÒNG LIÊN HỆ - 09 0917 5088</p>
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
          onClick={() => setShowChatPopup(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 relative"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
          </svg>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            3
          </div>
        </button>
      </div>

      {/* Chat Popup */}
      {showChatPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div className="bg-white rounded-lg shadow-xl w-90 h-120 flex flex-col animate-slide-up">
            {/* Header */}
            <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Travel AI</h3>
                  {/* <p className="text-sm text-blue-100">
                    Phục Vụ Bằng Cả Trái Tim
                  </p> */}
                </div>
              </div>
              <button
                onClick={() => setShowChatPopup(false)}
                className="text-white hover:text-blue-200 transition-colors"
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
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
                        </svg>
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
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 bg-white rounded-b-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`rounded-full p-2 transition-colors ${
                    newMessage.trim()
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-gray-600 p-2">
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
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

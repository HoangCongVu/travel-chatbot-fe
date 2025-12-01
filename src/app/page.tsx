"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginPopup from "@/components/LoginPopup";
import RegisterPopup from "@/components/RegisterPopup";
import UserDropdown from "@/components/UserDropdown";
import ChatPopup from "@/components/ChatPopup";
import { tourServices } from "@/services/tourServices";
import { userTokenManager } from "@/services/authServices";
import { ScanSearch, User } from "lucide-react";

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

// Tour type names mapping
const TOUR_TYPE_NAMES: { [key: number]: string } = {
  1: "Tour Trong Nước",
  2: "Tour Nước Ngoài",
  3: "Tour Trong Ngày",
  4: "Combo Du Lịch",
  5: "Team Building",
  6: "MICE",
  7: "Free & Easy",
};

export default function Home() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    destination: "",
    departure: "",
    departureDate: "",
  });
  const [activeFilters, setActiveFilters] = useState<{
    tour_type_id?: number;
    destination?: string;
    departure?: string;
    target_date?: string;
  }>({});

  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const toursPerPage = 10;
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "logout";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

  // Check for login/register success
  useEffect(() => {
    const loginSuccess = localStorage.getItem("user_login_success");
    const registerSuccess = localStorage.getItem("user_register_success");

    if (loginSuccess === "true") {
      localStorage.removeItem("user_login_success");
      showNotification("success", "Đăng nhập thành công!");
    }

    if (registerSuccess === "true") {
      localStorage.removeItem("user_register_success");
      showNotification("success", "Đăng ký thành công!");
    }
  }, []);

  // Helper function to show notification
  const showNotification = (
    type: "success" | "error" | "info" | "logout",
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
    showNotification("logout", "Đăng xuất thành công!");
  };

  // Handle tour type search
  const handleTourTypeSearch = (tourTypeId: number) => {
    const params = new URLSearchParams();
    params.set("tour_type_id", tourTypeId.toString());
    router.push(`/search?${params.toString()}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle search form submission
  const handleSearch = () => {
    const params = new URLSearchParams();

    // Giữ lại tour_type_id nếu đã được chọn trước đó
    if (activeFilters.tour_type_id) {
      params.set("tour_type_id", activeFilters.tour_type_id.toString());
    }

    if (searchData.destination?.trim()) {
      params.set("destination", searchData.destination.trim());
    }
    if (searchData.departure?.trim()) {
      params.set("departure", searchData.departure.trim());
    }
    if (searchData.departureDate?.trim()) {
      params.set("target_date", searchData.departureDate.trim());
    }

    router.push(`/search?${params.toString()}`);
  };

  // Handle navigate to tour detail page
  const handleViewTourDetail = (tourId: string) => {
    console.log("🚀 Navigating to tour:", tourId);
    router.push(`/tour/${tourId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      \{/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div
            className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 ${
              notification.type === "success"
                ? "bg-white border-green-500"
                : notification.type === "error"
                ? "bg-white border-red-500"
                : notification.type === "logout"
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
              ) : notification.type === "logout" ? (
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
                      d="M5 13l4 4L19 7"
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
                    : notification.type === "logout"
                    ? "text-red-800"
                    : "text-blue-800"
                }`}
              >
                {notification.type === "success"
                  ? "Thành công!"
                  : notification.type === "error"
                  ? "Lỗi!"
                  : notification.type === "logout"
                  ? "Thành công!"
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
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
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
                    <User className="w-4 h-4" />
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
      <div className="relative min-h-96 ">
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
      <div className="py-8 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
            <span className="text-blue-500">Loại hình</span> du lịch
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <div
              onClick={() => handleTourTypeSearch(1)}
              className={`rounded-xl p-4 text-center shadow-md transition-all duration-300 cursor-pointer ${
                activeFilters.tour_type_id === 1
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 shadow-xl ring-2 ring-blue-300"
                  : "bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                  activeFilters.tour_type_id === 1
                    ? "bg-white shadow-md"
                    : "bg-black"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeFilters.tour_type_id === 1
                      ? "text-blue-500"
                      : "text-white"
                  }`}
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
              <div className="text-sm font-semibold">Tour TRONG NƯỚC</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(2)}
              className={`rounded-xl p-4 text-center shadow-md transition-all duration-300 cursor-pointer ${
                activeFilters.tour_type_id === 2
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 shadow-xl ring-2 ring-blue-300"
                  : "bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                  activeFilters.tour_type_id === 2
                    ? "bg-white shadow-md"
                    : "bg-blue-500"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeFilters.tour_type_id === 2
                      ? "text-blue-500"
                      : "text-white"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="text-sm font-semibold">Tour NƯỚC NGOÀI</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(3)}
              className={`rounded-xl p-4 text-center shadow-md transition-all duration-300 cursor-pointer ${
                activeFilters.tour_type_id === 3
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 shadow-xl ring-2 ring-blue-300"
                  : "bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                  activeFilters.tour_type_id === 3
                    ? "bg-white shadow-md"
                    : "bg-green-500"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeFilters.tour_type_id === 3
                      ? "text-blue-500"
                      : "text-white"
                  }`}
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
              <div className="text-sm font-semibold">Tour TRONG NGÀY</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(4)}
              className={`rounded-xl p-4 text-center shadow-md transition-all duration-300 cursor-pointer ${
                activeFilters.tour_type_id === 4
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 shadow-xl ring-2 ring-blue-300"
                  : "bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                  activeFilters.tour_type_id === 4
                    ? "bg-white shadow-md"
                    : "bg-purple-500"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeFilters.tour_type_id === 4
                      ? "text-blue-500"
                      : "text-white"
                  }`}
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
              <div className="text-sm font-semibold">COMBO DU LỊCH</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(5)}
              className={`rounded-xl p-4 text-center shadow-md transition-all duration-300 cursor-pointer ${
                activeFilters.tour_type_id === 5
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 shadow-xl ring-2 ring-blue-300"
                  : "bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                  activeFilters.tour_type_id === 5
                    ? "bg-white shadow-md"
                    : "bg-orange-500"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeFilters.tour_type_id === 5
                      ? "text-blue-500"
                      : "text-white"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div className="text-sm font-semibold">TEAM BUILDING</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(6)}
              className={`rounded-xl p-4 text-center shadow-md transition-all duration-300 cursor-pointer ${
                activeFilters.tour_type_id === 6
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 shadow-xl ring-2 ring-blue-300"
                  : "bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                  activeFilters.tour_type_id === 6
                    ? "bg-white shadow-md"
                    : "bg-indigo-500"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeFilters.tour_type_id === 6
                      ? "text-blue-500"
                      : "text-white"
                  }`}
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
              <div className="text-sm font-semibold">MICE</div>
            </div>

            <div
              onClick={() => handleTourTypeSearch(7)}
              className={`rounded-xl p-4 text-center shadow-md transition-all duration-300 cursor-pointer ${
                activeFilters.tour_type_id === 7
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 shadow-xl ring-2 ring-blue-300"
                  : "bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                  activeFilters.tour_type_id === 7
                    ? "bg-white shadow-md"
                    : "bg-cyan-500"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeFilters.tour_type_id === 7
                      ? "text-blue-500"
                      : "text-white"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="text-sm font-semibold">FREE & EASY</div>
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
                              className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all cursor-pointer"
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  TÌM KIẾM TOUR
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Bạn muốn đến đâu?
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập điểm đến..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchData.destination}
                    onChange={(e) =>
                      handleInputChange("destination", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    Nơi khởi hành
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập nơi khởi hành..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchData.departure}
                    onChange={(e) =>
                      handleInputChange("departure", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ngày khởi hành
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchData.departureDate}
                    onChange={(e) =>
                      handleInputChange("departureDate", e.target.value)
                    }
                  />
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 cursor-pointer"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/10 blur-md"></div>
                  <ScanSearch className="z-[1]" />
                  <span className="z-[1]">Tìm kiếm</span>
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden p-7 text-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-2xl">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl opacity-20"></div>

              <div className="relative z-10 w-18 h-18 mx-auto mb-5 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-xl">
                <svg
                  className="w-9 h-9 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>

              <h3 className="relative z-10 text-xl font-semibold mb-2 tracking-wide">
                KHÁCH ĐOÀN TỔ CHỨC TOUR RIÊNG
              </h3>
              <p className="relative z-10 text-sm opacity-80">
                VUI LÒNG LIÊN HỆ
              </p>
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
      {/* Chat Popup Component */}
      <ChatPopup
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        onTokenExpired={handleTokenExpired}
      />
    </div>
  );
}

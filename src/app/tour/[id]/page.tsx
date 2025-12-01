"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { tourServices } from "@/services/tourServices";
import ChatPopup from "@/components/ChatPopup";
import { userTokenManager } from "@/services/authServices";

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
  highlight_locations?: string[];
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

interface TourDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TourDetailPage({ params }: TourDetailPageProps) {
  const resolvedParams = use(params);
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const requestMadeRef = useRef(false);

  // Check authentication status
  useEffect(() => {
    const token = userTokenManager.getToken();
    const email = localStorage.getItem("userEmail");
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  // Handle token expiration
  const handleTokenExpired = () => {
    userTokenManager.removeToken();
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserEmail("");
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  };

  useEffect(() => {
    const fetchTourDetail = async () => {
      // Prevent duplicate requests
      if (requestMadeRef.current) {
        console.log("🚫 Request already made, skipping...");
        return;
      }

      try {
        setLoading(true);
        requestMadeRef.current = true;
        console.log("🔍 Fetching tour with ID:", resolvedParams.id);
        const response = await tourServices.fetchTourById(resolvedParams.id);
        console.log("📡 Tour detail response:", response);

        // API trả về {tours: [...]} format
        if (response.tours && response.tours.length > 0) {
          setTour(response.tours[0]);
        } else {
          console.error("❌ No tour found in response");
        }
      } catch (error) {
        console.error("❌ Error fetching tour:", error);
        requestMadeRef.current = false; // Reset on error to allow retry
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchTourDetail();
    }
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Tour không tìm thấy
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Extract tour details for display
  const tourDetails = {
    code: tour.tour_id?.slice(-6) || resolvedParams.id.slice(-6) || "18437",
    duration: `${tour.days} ngày ${tour.days - 1} đêm`,
    departures:
      tour.departure_schedules && tour.departure_schedules.length > 0
        ? tour.departure_schedules[0].specific_dates?.join(", ") ||
          "05,12,15,19,26/10; 02,09,16,23,30/11; 07,14,21/12/2025"
        : "05,12,15,19,26/10; 02,09,16,23,30/11; 07,14,21/12/2025",
    transport: "Xe du lịch đời mới & Máy bay khứ hồi",
    startLocation:
      tour.departures && tour.departures.length > 0
        ? tour.departures[0]
        : "Từ Hồ Chí Minh",
    destinations:
      tour.destinations && tour.destinations.length > 0
        ? tour.destinations.join(" - ")
        : "Hà Nội - Bảo Tàng Quân Sự Việt Nam - Vịnh Hạ Long - Ninh Bình - Lào Cai - Sapa - Bắn Cát Cát - Chính Phục Đỉnh Fansipan",
    price: (() => {
      if (tour.price_by_packages && tour.price_by_packages.length > 0) {
        return tour.price_by_packages[0].price;
      } else if (tour.price_by_dates && tour.price_by_dates.length > 0) {
        return tour.price_by_dates[0].price;
      }
      return 9599000;
    })(),
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
              </a>
            </nav>

            {/* Right side with Back button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left Content */}
          <div className="lg:w-2/3">
            {/* Tour Title Section */}
            <div className="px-6 py-4 bg-white">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {tour.tour_name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="ml-1">4.9/5 trong 50 ĐÁNH GIÁ</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>1,771</span>
                </div>
              </div>
            </div>

            {/* Tour Image */}
            <div className="relative h-120 bg-gray-200 mx-6 rounded-lg overflow-hidden">
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
                  <div className="text-center text-white">
                    <svg
                      className="w-20 h-20 mx-auto mb-4 opacity-80"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xl font-medium">Tour Image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "details" && (
                <div>
                  <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                    Điểm nhấn hành trình
                  </h2>
                  <div className="mb-6">
                    {tour.destinations && (
                      <p className="text-gray-700 mb-4">
                        <strong>Hành trình:</strong>{" "}
                        {tour.destinations.join(", ")}
                      </p>
                    )}
                    {tour.departures && (
                      <p className="text-gray-700 mb-4">
                        <strong>Khởi hành:</strong> {tour.departures.join(", ")}
                      </p>
                    )}
                    {tour.days && (
                      <p className="text-gray-700 mb-4">
                        <strong>Lịch trình:</strong>{" "}
                        {tour.days
                          ? `${tour.days} ngày ${tour.days - 1} đêm`
                          : "Chưa có thông tin"}
                      </p>
                    )}
                    {tour.description && (
                      <p className="text-gray-700 mb-4">
                        <strong>Mô Tả Tour:</strong> {tour.description}
                      </p>
                    )}
                    {tour.highlight && (
                      <p className="text-gray-700 mb-4">
                        <strong>Điểm nhấn:</strong> {tour.highlight}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "itinerary" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Lịch trình chi tiết
                  </h2>
                  <p className="text-gray-600">
                    Thông tin lịch trình chi tiết sẽ được cập nhật...
                  </p>
                </div>
              )}

              {activeTab === "services" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Dịch vụ bao gồm và không bao gồm
                  </h2>
                  <p className="text-gray-600">
                    Thông tin dịch vụ sẽ được cập nhật...
                  </p>
                </div>
              )}

              {activeTab === "notes" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Ghi chú
                  </h2>
                  <p className="text-gray-600">
                    Thông tin ghi chú sẽ được cập nhật...
                  </p>
                </div>
              )}

              {activeTab === "departure" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Ngày khởi hành khác
                  </h2>
                  <p className="text-gray-600">
                    Thông tin ngày khởi hành khác sẽ được cập nhật...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-1/3 bg-gray-50 p-6 border-l border-gray-200 min-h-screen">
            {/* Tour Info Header */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-blue-600 uppercase mb-2">
                {tour.tour_name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã tour:</span>
                  <span className="font-medium">{tour.tour_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">
                    {tour.days
                      ? `${tour.days} ngày ${tour.days - 1} đêm`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khởi hành:</span>
                  <span className="font-medium text-right max-w-48 break-words">
                    {tour.departures?.join(", ") || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Điểm đến:</span>
                  <span className="font-medium">
                    {tour.destinations?.[0] || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gói:</span>
                  <span className="font-medium">
                    {tour.price_by_packages?.[0]?.package_name && (
                      <p className="text-sm opacity-80 mt-1">
                        {tour.price_by_packages[0].package_name}
                      </p>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  Giá từ:
                  {tour.price_by_packages?.[0]?.price
                    ? tour.price_by_packages[0].price.toLocaleString("vi-VN") +
                      " đ"
                    : "Liên hệ"}
                </p>
              </div>
            </div>

            {/* Experiences */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-3">Trải nghiệm:</h4>
              <div className="space-y-2">
                {tour.highlight_locations &&
                tour.highlight_locations.length > 0 ? (
                  tour.highlight_locations.map((location, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex-shrink-0 mt-0.5"></div>
                      <span className="text-sm text-gray-700">{location}</span>
                    </div>
                  ))
                ) : tour.highlight ? (
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-sm flex-shrink-0 mt-0.5"></div>
                    <span className="text-sm text-gray-700">
                      {tour.highlight}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Chưa có thông tin trải nghiệm
                  </p>
                )}
              </div>
            </div>

            {/* Booking Date */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
                <input
                  type="date"
                  defaultValue="2025-11-09"
                  className="w-full bg-white text-gray-800 p-3 rounded border-none text-center font-medium"
                />
              </div>
            </div>

            {/* Book Button */}
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-bold text-lg mb-4 hover:from-blue-600 hover:to-blue-700 transition-all">
              ĐẶT TOUR
            </button>

            {/* Tabs for more details */}
            <div className="space-y-2">
              <div className="flex items-center text-gray-600 py-2 border-b border-gray-200">
                <span className="w-5 h-5 bg-gray-400 rounded-full text-white text-xs flex items-center justify-center mr-3">
                  📋
                </span>
                <span>Lịch trình</span>
              </div>
              <div className="flex items-center text-gray-600 py-2 border-b border-gray-200">
                <span className="w-5 h-5 bg-gray-400 rounded-full text-white text-xs flex items-center justify-center mr-3">
                  🛎️
                </span>
                <span>Dịch vụ bao gồm và không bao gồm</span>
              </div>
              <div className="flex items-center text-gray-600 py-2 border-b border-gray-200">
                <span className="w-5 h-5 bg-gray-400 rounded-full text-white text-xs flex items-center justify-center mr-3">
                  📝
                </span>
                <span>Ghi chú</span>
              </div>
              <div className="flex items-center text-gray-600 py-2">
                <span className="w-5 h-5 bg-gray-400 rounded-full text-white text-xs flex items-center justify-center mr-3">
                  📅
                </span>
                <span>Ngày khởi hành khác</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Popup Component */}
      <ChatPopup
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        onTokenExpired={handleTokenExpired}
      />
    </div>
  );
}

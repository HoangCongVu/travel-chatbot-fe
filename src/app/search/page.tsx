"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tourServices } from "@/services/tourServices";
import { cartServices, cartStorage } from "@/services/cartServices";
import CartPopup from "@/components/CartPopup";
import {
  ArrowLeftFromLine,
  Delete,
  ScanSearch,
  X,
  ShoppingCart,
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

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const toursPerPage = 10;

  const [activeFilters, setActiveFilters] = useState<{
    tour_type_id?: number;
    destination?: string;
    departure?: string;
    target_date?: string;
  }>({});

  const [searchData, setSearchData] = useState({
    destination: "",
    departure: "Hồ Chí Minh",
    departureDate: "",
  });

  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Load cart item count
  const loadCartCount = async () => {
    const cartId = cartStorage.getCartId();
    if (!cartId) return;

    try {
      const total = await cartServices.getCartTotal(cartId);
      setCartItemCount(total.total_items);
    } catch (error) {
      console.error("❌ Error loading cart count:", error);
    }
  };

  // Load cart count on mount
  useEffect(() => {
    loadCartCount();
  }, []);

  // Load filters from URL params
  useEffect(() => {
    const filters: any = {};

    const tourTypeId = searchParams.get("tour_type_id");
    const destination = searchParams.get("destination");
    const departure = searchParams.get("departure");
    const targetDate = searchParams.get("target_date");

    if (tourTypeId) filters.tour_type_id = parseInt(tourTypeId);
    if (destination) filters.destination = destination;
    if (departure) filters.departure = departure;
    if (targetDate) filters.target_date = targetDate;

    setActiveFilters(filters);

    // Update search form data
    if (destination) setSearchData((prev) => ({ ...prev, destination }));
    if (departure) setSearchData((prev) => ({ ...prev, departure }));
    if (targetDate)
      setSearchData((prev) => ({ ...prev, departureDate: targetDate }));

    // Fetch tours with filters
    if (Object.keys(filters).length > 0) {
      fetchToursWithFilters(filters);
    }
  }, [searchParams]);

  const fetchToursWithFilters = async (filters: any) => {
    try {
      setLoading(true);
      console.log(`🔍 Searching tours with filters:`, filters);

      const response = await tourServices.searchToursByFields({
        ...filters,
        page: currentPage,
        limit: toursPerPage,
      });
      console.log("📥 Search API Response:", response);

      let toursData = response?.data?.tours || response?.tours || [];
      console.log(`📊 Tours found: ${toursData.length} tours`);

      const totalResults =
        response?.total_results ||
        response?.data?.total_results ||
        toursData.length;

      if (toursData.length > 0) {
        toursData = toursData.sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || a.tour_id || 0);
          const dateB = new Date(b.created_at || b.tour_id || 0);
          return dateB.getTime() - dateA.getTime();
        });
      }

      setTours(toursData);
      setTotalTours(totalResults);

      if (toursData.length === 0) {
        setError("Không tìm thấy tour nào phù hợp với yêu cầu của bạn.");
      } else {
        setError("");
      }
    } catch (err) {
      setError("Không thể tìm kiếm tour. Vui lòng thử lại sau.");
      console.error("Error searching tours:", err);
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

  const handleSearch = () => {
    const params = new URLSearchParams();

    // Keep tour_type_id if already in filters
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

  const handleClearFilters = () => {
    setSearchData({
      destination: "",
      departure: "Hồ Chí Minh",
      departureDate: "",
    });
    router.push("/");
  };

  const handleViewTourDetail = (tourId: string) => {
    console.log("🚀 Navigating to tour:", tourId);
    router.push(`/tour/${tourId}`);
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
              {/* Cart Icon */}
              <button
                onClick={() => setShowCartPopup(true)}
                className="relative flex items-center text-gray-700 space-x-1 hover:text-blue-400 cursor-pointer transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
                <span>Giỏ hàng</span>
              </button>
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tour Listings */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Kết quả tìm kiếm
              </h1>
              {totalTours > 0 && (
                <p className="text-gray-600">
                  Tìm thấy{" "}
                  <span className="font-semibold text-blue-600">
                    {totalTours}
                  </span>{" "}
                  tour
                </p>
              )}
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-80 h-64 bg-gray-300"></div>
                      <div className="flex-1 p-6 space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                          <div className="h-8 bg-gray-300 rounded w-24"></div>
                          <div className="h-10 bg-gray-300 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium cursor-pointer transition-all"
                >
                  Xem tất cả tour
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="space-y-6">
                  {tours.map((tour, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-55 relative"
                    >
                      {/* {tour.promotion_info && (
                        <div className="absolute -top-2 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg z-10">
                          {tour.promotion_info}
                        </div>
                      )} */}
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

                        {/* Tour Info */}
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
                                    {tour.departures?.join(", ") ||
                                      "Nhiều điểm"}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">🎯</span>
                                <span className="truncate">
                                  Điểm đến:{" "}
                                  <strong>
                                    {tour.destinations?.join(", ") || "Đa dạng"}
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
                                  }
                                  return "Liên hệ";
                                })()}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleViewTourDetail(
                                  tour.tour_id || "sample-tour-id"
                                )
                              }
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
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        Trước
                      </button>

                      <span className="px-4 py-2 text-sm text-gray-700">
                        Trang {currentPage} /{" "}
                        {Math.ceil(totalTours / toursPerPage)}
                      </span>

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={
                          currentPage >= Math.ceil(totalTours / toursPerPage)
                        }
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
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
              </div>
            )}
          </div>

          {/* Sidebar Filter */}
          <div className="lg:w-96">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 sticky top-24">
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
                  LỌC TOUR THEO
                </h3>
                {Object.keys(activeFilters).length > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="group flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-red-300/40 cursor-pointer"
                  >
                    <Delete className="w-4 h-4 group-hover:rotate-12 transition" />
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              {/* Active Filters Display */}
              {Object.keys(activeFilters).length > 0 && (
                <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    Đang lọc theo:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.tour_type_id && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                        <svg
                          className="w-3 h-3 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {TOUR_TYPE_NAMES[activeFilters.tour_type_id] ||
                          `Loại tour ${activeFilters.tour_type_id}`}
                      </span>
                    )}
                    {activeFilters.destination && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-full shadow-sm">
                        <svg
                          className="w-3 h-3 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Đến: {activeFilters.destination}
                      </span>
                    )}
                    {activeFilters.departure && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-full shadow-sm">
                        <svg
                          className="w-3 h-3 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Từ: {activeFilters.departure}
                      </span>
                    )}
                    {activeFilters.target_date && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-full shadow-sm">
                        <svg
                          className="w-3 h-3 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Ngày: {activeFilters.target_date}
                      </span>
                    )}
                  </div>
                </div>
              )}

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
          </div>
        </div>
      </div>

      {/* Cart Popup Component */}
      <CartPopup
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        onCartUpdate={loadCartCount}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { tourServices } from "@/services/tourServices";
import CreateTourPopup from "./createTour";
import { TourForm } from "./components";
import { Trash2, Loader2, SquarePen } from "lucide-react";

// Tour Management Component
export default function TourManagement() {
  const [showCreateTourPopup, setShowCreateTourPopup] = useState(false);
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const toursPerPage = 12;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingTourId, setDeletingTourId] = useState<string | null>(null);
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [showTourDetail, setShowTourDetail] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);
  const [showEditTourPopup, setShowEditTourPopup] = useState(false);

  // Fetch tours from API - COPY EXACT LOGIC FROM page.tsx
  const fetchTours = async () => {
    try {
      setLoading(true);
      console.log(
        `🔍 Admin fetching page ${currentPage} with limit ${toursPerPage}`
      );

      const response = await tourServices.fetchAllTours(
        currentPage,
        toursPerPage
      );
      console.log("📥 Admin API Response:", response);

      if (!response || !response.data) {
        throw new Error("Không thể tải danh sách tour");
      }

      // Handle the actual API structure: response.data.tours - SAME AS page.tsx
      let toursData = response?.data?.tours || response?.tours || [];
      console.log(`📊 Admin tours received: ${toursData.length} tours`);

      // If backend doesn't handle pagination properly, do it on frontend - SAME AS page.tsx
      const totalToursFromAPI = toursData.length;
      const totalResults =
        response?.total_results ||
        response?.data?.total_results ||
        totalToursFromAPI;

      // Sort tours by creation date (newest first) if available - SAME AS page.tsx
      if (toursData.length > 0) {
        toursData = toursData.sort((a: any, b: any) => {
          // Assuming tours have a created_at or similar field
          const dateA = new Date(a.created_at || a.tour_id || 0);
          const dateB = new Date(b.created_at || b.tour_id || 0);
          return dateB.getTime() - dateA.getTime(); // Newest first
        });

        // If API returns all tours, slice to show only current page - SAME AS page.tsx
        if (totalToursFromAPI > toursPerPage) {
          const startIndex = (currentPage - 1) * toursPerPage;
          const endIndex = startIndex + toursPerPage;
          toursData = toursData.slice(startIndex, endIndex);
          console.log(
            `✂️ Admin sliced to show tours ${startIndex + 1}-${Math.min(
              endIndex,
              totalToursFromAPI
            )}`
          );
        }
      }

      // Transform tours for admin display - MODIFIED for admin
      const transformedTours = toursData.map((tour: any) => {
        return {
          id: tour.tour_id,
          tour_id: tour.tour_id,
          tour_name: tour.tour_name,
          days: tour.days,
          description: tour.description,
          highlight: tour.highlight,
          itinerary_url: tour.itinerary_url,
          image_url: tour.image_url,
          promotion_info: tour.promotion_info,
          price_type: tour.price_type,
          departures: tour.departures || [],
          destinations: tour.destinations || [],
          highlight_locations: tour.highlight_locations || [],
          visa_price:
            tour.visa_prices && tour.visa_prices.length > 0
              ? tour.visa_prices[0].price
              : null,
          departure_schedules: tour.departure_schedules || [],
          visa_prices: tour.visa_prices || [],
          price_by_packages: tour.price_by_packages || [],
          price_by_dates: tour.price_by_dates || [],
          price: getDisplayPrice(tour),
          duration: `${tour.days} ngày ${tour.days - 1} đêm`,
          departureDate: getNextDepartureDate(tour.departure_schedules),
          status: "Hoạt động",
        };
      });

      console.log(
        `📋 Final admin tours to display: ${transformedTours.length} tours`
      );
      console.log(`🎯 Admin total results: ${totalResults}`);

      setTours(transformedTours);
      setTotalResults(totalResults);
    } catch (error: any) {
      console.error("Admin error fetching tours:", error);
      setError(
        error.message || "Không thể tải danh sách tour. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get display price
  const getDisplayPrice = (tour: any) => {
    if (tour.price_by_dates && tour.price_by_dates.length > 0) {
      const minPrice = Math.min(
        ...tour.price_by_dates.map((p: any) => p.price)
      );
      return `${minPrice.toLocaleString("vi-VN")} đ`;
    }
    if (tour.price_by_packages && tour.price_by_packages.length > 0) {
      const minPrice = Math.min(
        ...tour.price_by_packages.map((p: any) => p.price)
      );
      return `${minPrice.toLocaleString("vi-VN")} đ`;
    }
    return "Liên hệ";
  };

  // Helper function to get next departure date
  const getNextDepartureDate = (schedules: any[]) => {
    if (!schedules || schedules.length === 0) return "Liên hệ";

    const schedule = schedules[0];
    if (
      schedule.schedule_type === "specific" &&
      schedule.specific_dates &&
      schedule.specific_dates.length > 0
    ) {
      const date = new Date(schedule.specific_dates[0]);
      return date.toLocaleDateString("vi-VN");
    }
    return "Liên hệ";
  };

  // Show tour details
  const showTourDetails = (tour: any) => {
    setSelectedTour(tour);
    setShowTourDetail(true);
  };

  // Show edit tour
  const showEditTour = (tour: any) => {
    setEditingTour(tour);
    setShowEditTourPopup(true);
  };

  // Close edit tour popup
  const closeEditTour = () => {
    setEditingTour(null);
    setShowEditTourPopup(false);
    // Refresh tour list after edit
    fetchTours();
  };

  // Show delete confirmation
  const showDeleteConfirmation = (tourId: string, tourName: string) => {
    setTourToDelete({ id: tourId, name: tourName });
    setShowDeleteConfirm(true);
  };

  // Delete tour
  const handleDeleteTour = async () => {
    if (!tourToDelete) return;

    try {
      setDeletingTourId(tourToDelete.id);
      await tourServices.deleteTour(tourToDelete.id);

      // Remove tour from local state
      setTours((prevTours) =>
        prevTours.filter((tour) => tour.id !== tourToDelete.id)
      );
      setTotalResults((prev) => prev - 1);

      // Close popup and reset state
      setShowDeleteConfirm(false);
      setTourToDelete(null);
    } catch (error: any) {
      console.error("Error deleting tour:", error);
      alert("Lỗi khi xóa tour: " + (error.message || "Unknown error"));
    } finally {
      setDeletingTourId(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTourToDelete(null);
  };

  // COPY EXACT useEffect from page.tsx
  useEffect(() => {
    fetchTours();
  }, [currentPage]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Tour</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách tour...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Tour</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Lỗi tải dữ liệu
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={() => fetchTours()}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Tour</h2>
          <p className="text-sm text-gray-600 mt-1">
            Hiển thị {tours.length} / {totalResults} tour
          </p>
        </div>
        <button
          onClick={() => setShowCreateTourPopup(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
        >
          Tạo Tour Mới
        </button>
      </div>

      {tours.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Chưa có tour nào
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách tạo tour mới.
          </p>
        </div>
      ) : (
        <>
          {/* Tours Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => showTourDetails(tour)}
              >
                {/* Tour Image - HIỂN THỊ ẢNH THẬT */}
                <div className="relative h-48">
                  {tour.image_url &&
                  tour.image_url.trim() !== "" &&
                  tour.image_url.startsWith("http") &&
                  !tour.image_url.includes("KHÔNG CÓ ẢNH") &&
                  !tour.image_url.includes("string") ? (
                    <>
                      <img
                        src={tour.image_url}
                        alt={tour.tour_name}
                        className="w-full h-full object-cover"
                        onLoad={() =>
                          console.log(
                            "✅ Ảnh tải thành công:",
                            tour.tour_name,
                            tour.image_url
                          )
                        }
                        onError={(e) => {
                          console.error(
                            "❌ Lỗi tải ảnh:",
                            tour.tour_name,
                            tour.image_url
                          );
                          // Hiển thị nền đen với text khi lỗi
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="text-sm font-medium">KHÔNG CÓ ẢNH</div>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 text-white text-sm font-medium bg-opacity-30 px-2 py-1 rounded">
                    {tour.departures?.[0] || "Từ Hồ Chí Minh"}
                  </div>
                  <div className="absolute inset-0 bg-opacity-10"></div>
                </div>

                {/* Tour Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {tour.tour_name}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Lịch trình: {tour.duration}
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Khởi hành: {tour.departureDate}
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      Điểm đến: {tour.destinations?.join(", ") || "Nhiều điểm"}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-600">
                        {tour.price}
                      </span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {tour.status}
                    </span>

                    <div
                      className="flex space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => showEditTour(tour)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors flex items-center cursor-pointer"
                        title="Sửa tour"
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          showDeleteConfirmation(tour.id, tour.tour_name)
                        }
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors flex items-center cursor-pointer"
                        disabled={deletingTourId === tour.id}
                        title={
                          deletingTourId === tour.id
                            ? "Đang xóa..."
                            : "Xóa tour"
                        }
                      >
                        {deletingTourId === tour.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - COPY EXACT FROM page.tsx */}
          {totalResults > toursPerPage && (
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
                  const totalPages = Math.ceil(totalResults / toursPerPage);
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
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
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
                    currentPage >= Math.ceil(totalResults / toursPerPage)
                  }
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage >= Math.ceil(totalResults / toursPerPage)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Sau
                </button>
              </div>
            </div>
          )}

          {/* Page Info - COPY EXACT FROM page.tsx */}
          {totalResults > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Hiển thị{" "}
              {Math.min((currentPage - 1) * toursPerPage + 1, totalResults)} -{" "}
              {Math.min(currentPage * toursPerPage, totalResults)} trong tổng số{" "}
              {totalResults} tour
            </div>
          )}
        </>
      )}

      {/* Tour Detail Popup - REDESIGNED */}
      {showTourDetail && selectedTour && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedTour.tour_name}
                  </h3>
                  <div className="flex items-center gap-4 text-blue-100">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {selectedTour.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {selectedTour.destinations?.join(", ") || "Nhiều điểm"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTourDetail(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Image Section - Always show */}
              <div className="relative h-100 bg-gradient-to-br from-gray-200 to-gray-300">
                {selectedTour.image_url &&
                selectedTour.image_url.trim() !== "" &&
                selectedTour.image_url.startsWith("http") ? (
                  <img
                    src={selectedTour.image_url}
                    alt={selectedTour.tour_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide broken image and show placeholder
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <svg
                      className="w-20 h-20 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="text-sm font-medium">Chưa có hình ảnh</div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white font-bold text-2xl drop-shadow-lg">
                    {selectedTour.price}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Departure Info */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      <h6 className="font-semibold text-green-900">
                        Điểm khởi hành
                      </h6>
                    </div>
                    <p className="text-green-800">
                      {selectedTour.departures?.join(", ") ||
                        "Chưa có thông tin"}
                    </p>
                  </div>

                  {/* Highlight Locations */}
                  {selectedTour.highlight_locations &&
                    selectedTour.highlight_locations.length > 0 && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <h6 className="font-semibold text-purple-900">
                            Địa điểm nổi bật
                          </h6>
                        </div>
                        <p className="text-purple-800">
                          {selectedTour.highlight_locations.join(", ")}
                        </p>
                      </div>
                    )}
                </div>

                {/* Pricing & Schedule Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Schedule */}
                  {selectedTour.departure_schedules &&
                    selectedTour.departure_schedules.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h6 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Lịch khởi hành
                        </h6>
                        {selectedTour.departure_schedules.map(
                          (schedule: any, index: number) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg p-3 mb-2"
                            >
                              <div className="text-sm text-blue-700 font-medium">
                                Loại: {schedule.schedule_type}
                              </div>
                              {schedule.specific_dates && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {schedule.specific_dates
                                    .map((date: string) =>
                                      new Date(date).toLocaleDateString("vi-VN")
                                    )
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {/* Prices */}
                  <div className="space-y-4">
                    {selectedTour.price_by_dates &&
                      selectedTour.price_by_dates.length > 0 && (
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                          <h6 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Giá theo ngày
                          </h6>
                          {selectedTour.price_by_dates.map(
                            (priceData: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between bg-white rounded-lg p-2 mb-2"
                              >
                                <span className="text-gray-700">
                                  {new Date(priceData.date).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                                <span className="font-bold text-red-600">
                                  {priceData.price.toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* Visa Price */}
                    {selectedTour.visa_price !== undefined &&
                      selectedTour.visa_price !== null && (
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                          <h6 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                              <path
                                fillRule="evenodd"
                                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Giá Visa
                          </h6>
                          <div className="bg-white rounded-lg p-3">
                            <span className="font-bold text-indigo-600 text-lg">
                              {selectedTour.visa_price === 0
                                ? "Không yêu cầu visa"
                                : `${selectedTour.visa_price.toLocaleString(
                                    "vi-VN"
                                  )} đ`}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Promotion */}
                {selectedTour.promotion_info &&
                  selectedTour.promotion_info !== "Chưa có khuyến mãi" && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-300">
                      <h6 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-orange-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"
                            clipRule="evenodd"
                          />
                          <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                        </svg>
                        🎉 Khuyến mãi đặc biệt
                      </h6>
                      <p className="text-orange-800 font-medium">
                        {selectedTour.promotion_info}
                      </p>
                    </div>
                  )}
                {/* Description & Highlights */}
                {(selectedTour.description || selectedTour.highlight) && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    {selectedTour.description && (
                      <div className="mb-4">
                        <h6 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Mô tả
                        </h6>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {selectedTour.description}
                        </p>
                      </div>
                    )}
                    {selectedTour.highlight && (
                      <div>
                        <h6 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-yellow-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Điểm nổi bật
                        </h6>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {selectedTour.highlight}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg
                className="w-8 h-8 text-red-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                Xác nhận xóa
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa tour{" "}
                <span className="font-semibold text-gray-900">
                  "{tourToDelete?.name}"
                </span>
                ?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Hành động này không thể hoàn tác!
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={deletingTourId !== null}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteTour}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={deletingTourId !== null}
              >
                {deletingTourId ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Tour Popup */}
      {showCreateTourPopup && (
        <CreateTourPopup onClose={() => setShowCreateTourPopup(false)} />
      )}

      {/* Edit Tour Popup */}
      {showEditTourPopup && editingTour && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <button
            onClick={closeEditTour}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="p-0">
            <TourForm
              onSuccess={closeEditTour}
              isEdit={true}
              initialValues={editingTour}
            />
          </div>
        </div>
      )}
    </div>
  );
}

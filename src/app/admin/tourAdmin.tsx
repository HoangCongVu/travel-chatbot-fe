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
  const [loadingMore, setLoadingMore] = useState(false);
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

  // Fetch tours from API
  const fetchTours = async (page = 1, appendToList = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await tourServices.fetchAllTours(page, 5);

      if (!data || !data.data) {
        throw new Error("Không thể tải danh sách tour");
      }

      console.log("🔍 Raw API data:", data.data.tours);

      const transformedTours = data.data.tours.map((tour: any) => {
        console.log(
          `📋 Tour: "${tour.tour_name}" - Image URL:`,
          tour.image_url || "KHÔNG CÓ ẢNH"
        );
        return {
          id: tour.id || `tour_${Math.random().toString(36).substr(2, 9)}`,
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
          departure_schedules: tour.departure_schedules || [],
          visa_prices: tour.visa_prices || [],
          price_by_packages: tour.price_by_packages || [],
          price_by_dates: tour.price_by_dates || [],
          // Computed fields for display
          price: getDisplayPrice(tour),
          duration: `${tour.days} ngày ${tour.days - 1} đêm`,
          departureDate: getNextDepartureDate(tour.departure_schedules),
          status: "Hoạt động",
        };
      });

      if (appendToList) {
        setTours((prevTours) => [...prevTours, ...transformedTours]);
      } else {
        setTours(transformedTours);
      }

      setTotalResults(data.total_results);
      setCurrentPage(page);
    } catch (error: any) {
      console.error("Error fetching tours:", error);
      setError(error.message || "Lỗi khi tải danh sách tour");
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  // Load more tours
  const loadMoreTours = () => {
    const nextPage = currentPage + 1;
    const maxPage = Math.ceil(totalResults / 5);
    if (nextPage <= maxPage) {
      fetchTours(nextPage, true);
    }
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

  useEffect(() => {
    fetchTours();
  }, []);

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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
                  {tour.image_url ? (
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
                      {/* Hiển thị URL ảnh để debug */}
                      <div className="absolute bottom-0 left-0 right-0 bg-opacity-80 text-white text-xs p-1"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-blue-400 flex flex-col items-center justify-center text-white">
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
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors flex items-center"
                        title="Sửa tour"
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          showDeleteConfirmation(tour.id, tour.tour_name)
                        }
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors flex items-center"
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

          {/* Load More Button */}
          {tours.length < totalResults && (
            <div className="text-center mt-8">
              <button
                onClick={loadMoreTours}
                disabled={loadingMore}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center mx-auto"
              >
                {loadingMore ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                    Đang tải...
                  </>
                ) : (
                  `Tải thêm (${totalResults - tours.length} tour còn lại)`
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Tour Detail Popup */}
      {showTourDetail && selectedTour && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Chi tiết Tour
              </h3>
              <button
                onClick={() => setShowTourDetail(false)}
                className="text-gray-400 hover:text-gray-600"
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

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">
                    {selectedTour.tour_name}
                  </h4>

                  {selectedTour.image_url && (
                    <img
                      src={selectedTour.image_url}
                      alt={selectedTour.tour_name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="space-y-3">
                    <div>
                      <strong>Mô tả:</strong>{" "}
                      {selectedTour.description || "Chưa có mô tả"}
                    </div>
                    <div>
                      <strong>Điểm nổi bật:</strong>{" "}
                      {selectedTour.highlight || "Chưa có thông tin"}
                    </div>
                    <div>
                      <strong>Thời gian:</strong> {selectedTour.duration}
                    </div>
                    <div>
                      <strong>Điểm khởi hành:</strong>{" "}
                      {selectedTour.departures?.join(", ") ||
                        "Chưa có thông tin"}
                    </div>
                    <div>
                      <strong>Điểm đến:</strong>{" "}
                      {selectedTour.destinations?.join(", ") ||
                        "Chưa có thông tin"}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <h5 className="font-semibold mb-3">
                    Thông tin giá và lịch trình
                  </h5>

                  {/* Price by Dates */}
                  {selectedTour.price_by_dates &&
                    selectedTour.price_by_dates.length > 0 && (
                      <div className="mb-4">
                        <h6 className="font-medium mb-2">Giá theo ngày:</h6>
                        <div className="space-y-2">
                          {selectedTour.price_by_dates.map(
                            (priceData: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between bg-gray-50 p-2 rounded"
                              >
                                <span>
                                  {new Date(priceData.date).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                                <span className="font-semibold text-red-600">
                                  {priceData.price.toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Departure Schedules */}
                  {selectedTour.departure_schedules &&
                    selectedTour.departure_schedules.length > 0 && (
                      <div className="mb-4">
                        <h6 className="font-medium mb-2">Lịch khởi hành:</h6>
                        <div className="space-y-2">
                          {selectedTour.departure_schedules.map(
                            (schedule: any, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-2 rounded"
                              >
                                <div>
                                  <strong>Loại:</strong>{" "}
                                  {schedule.schedule_type}
                                </div>
                                {schedule.specific_dates && (
                                  <div>
                                    <strong>Ngày:</strong>{" "}
                                    {schedule.specific_dates
                                      .map((date: string) =>
                                        new Date(date).toLocaleDateString(
                                          "vi-VN"
                                        )
                                      )
                                      .join(", ")}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Promotion Info */}
                  {selectedTour.promotion_info && (
                    <div className="mb-4">
                      <h6 className="font-medium mb-2">
                        Thông tin khuyến mãi:
                      </h6>
                      <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                        {selectedTour.promotion_info}
                      </div>
                    </div>
                  )}
                </div>
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

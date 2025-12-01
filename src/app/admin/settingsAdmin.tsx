"use client";

import { useState, useEffect } from "react";
import { adminServices } from "@/services/adminServices";

export default function SettingsAdminComponent() {
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

          <div className="pt-2 border-t border-gray-200">
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

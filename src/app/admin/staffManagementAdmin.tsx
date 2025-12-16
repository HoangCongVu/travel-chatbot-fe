"use client";

import { useState, useEffect } from "react";
import { adminServices } from "@/services/adminServices";
import {
  Loader2,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

// Staff Management Component
export default function StaffManagementAdminComponent() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Create staff state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  // Helper function to show notification
  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "info", message: "" });
    }, 3000);
  };

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      setLoading(true);
      console.log("Fetching staff from Next.js API route");

      const data = await adminServices.fetchAllStaff();

      if (!data) {
        throw new Error("Failed to fetch staff");
      }

      // Transform API data to match UI format
      const transformedStaff = data.map((staffMember: any) => ({
        id: staffMember.id,
        name: staffMember.full_name,
        email: staffMember.email,
        role: staffMember.role,
        joinDate: new Date(staffMember.created_at).toLocaleDateString("vi-VN"),
        status: "Active", // Default status
      }));

      setStaff(transformedStaff);
    } catch (error: any) {
      console.error("Error fetching staff:", error);
      setError(error.message || "Lỗi khi tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation popup
  const showDeleteConfirmation = (staffId: string, staffName: string) => {
    setStaffToDelete({ id: staffId, name: staffName });
    setShowDeleteConfirm(true);
  };

  // Delete staff function
  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      setDeletingStaffId(staffToDelete.id);
      await adminServices.deleteStaff(staffToDelete.id);

      // Remove staff from local state
      setStaff((prevStaff) =>
        prevStaff.filter(
          (staffMember: any) => staffMember.id !== staffToDelete.id
        )
      );

      // Close popup and reset state
      setShowDeleteConfirm(false);
      setStaffToDelete(null);

      // Show success notification
      showNotification("success", "Xóa staff thành công!");
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      showNotification("error", error.message || "Lỗi khi xóa nhân viên");
    } finally {
      setDeletingStaffId(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setStaffToDelete(null);
  };

  // Create staff functions
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password confirmation
    if (createFormData.password !== createFormData.confirmPassword) {
      showNotification("error", "Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsCreating(true);

    try {
      const result = await adminServices.createStaff(
        createFormData.fullName,
        createFormData.email,
        createFormData.password
      );

      if (result) {
        // Refresh staff list
        await fetchStaff();

        // Close popup and reset form
        setIsCreateModalOpen(false);
        setCreateFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        // Show success notification
        showNotification("success", "Tạo staff thành công!");
      }
    } catch (error: any) {
      console.error("Error creating staff:", error);
      showNotification(
        "error",
        error.response?.data?.detail || error.message || "Lỗi khi tạo staff"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cancelCreate = () => {
    setIsCreateModalOpen(false);
    setCreateFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Staff Management
          </h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="mt-2 text-gray-600">
              Đang tải danh sách nhân viên...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Staff Management
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStaff}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
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
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              ) : notification.type === "error" ? (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Info className="w-6 h-6 text-blue-500" />
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
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Staff Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng cộng: {staff.length} nhân viên
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Tạo Staff
        </button>
      </div>

      {/* Staff Table */}
      {staff.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có nhân viên nào
          </h3>
          <p className="text-gray-600">
            Danh sách nhân viên sẽ hiển thị ở đây khi có dữ liệu.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((staffMember: any) => (
                  <tr key={staffMember.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {staffMember.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {staffMember.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {staffMember.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {staffMember.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {staffMember.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staffMember.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {staffMember.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          showDeleteConfirmation(
                            staffMember.id,
                            staffMember.name
                          )
                        }
                        disabled={deletingStaffId === staffMember.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 transition-colors ml-auto"
                        title="Xóa nhân viên"
                      >
                        {deletingStaffId === staffMember.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
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
                Bạn có chắc chắn muốn xóa nhân viên{" "}
                <span className="font-semibold text-gray-900">
                  "{staffToDelete?.name}"
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
                disabled={deletingStaffId !== null}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteStaff}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={deletingStaffId !== null}
              >
                {deletingStaffId ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
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

      {/* Create Staff Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tạo Staff Mới
            </h3>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={createFormData.fullName}
                  onChange={handleCreateFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={createFormData.email}
                  onChange={handleCreateFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  name="password"
                  value={createFormData.password}
                  onChange={handleCreateFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={createFormData.confirmPassword}
                  onChange={handleCreateFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cancelCreate}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo Staff"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { adminServices } from "@/services/adminServices";
import { Trash2, CheckCircle, XCircle, Info } from "lucide-react";

// Document Management Component
export default function DocumentManagement() {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
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

  // Fetch documents from API on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await adminServices.fetchAllFiles();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
        showNotification("error", "Không thể tải danh sách tài liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setShowUploadPopup(false);

    let uploadSuccess = false;
    let failedCount = 0;

    for (const file of Array.from(files)) {
      // Add temporary document to show upload progress
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const tempDoc = {
        id: tempId,
        file_name: file.name,
        file_url: "#",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "Đang tải lên...",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      };
      setDocuments((prev) => [...prev, tempDoc]);

      try {
        // Call API to upload file
        await adminServices.uploadFileAgent(file);
        uploadSuccess = true;

        // Remove temp document
        setDocuments((prev) => prev.filter((doc) => doc.id !== tempId));
      } catch (error: any) {
        console.error("Upload error:", error);
        failedCount++;
        // Remove failed upload from list
        setDocuments((prev) => prev.filter((doc) => doc.id !== tempId));
      }
    }

    // Reload documents list after all uploads
    if (uploadSuccess) {
      try {
        const data = await adminServices.fetchAllFiles();
        setDocuments(data);

        if (failedCount === 0) {
          showNotification("success", "Tải lên tài liệu thành công!");
        } else {
          showNotification(
            "success",
            `Tải lên thành công! (${failedCount} tệp thất bại)`
          );
        }
      } catch (error) {
        console.error("Error refreshing documents:", error);
      }
    } else if (failedCount > 0) {
      showNotification("error", "Tải lên tất cả tệp thất bại");
    }
  };

  // Show delete confirmation popup
  const showDeleteConfirmation = (fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName });
    setShowDeleteConfirm(true);
  };

  // Delete file function
  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      setDeletingFileId(fileToDelete.id);
      await adminServices.deleteFile(fileToDelete.id);

      // Remove file from local state
      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== fileToDelete.id)
      );

      // Close popup and reset state
      setShowDeleteConfirm(false);
      setFileToDelete(null);
      showNotification("success", "Đã xóa tài liệu thành công");
    } catch (error: any) {
      console.error("Error deleting file:", error);
      showNotification(
        "error",
        "Lỗi khi xóa tài liệu: " + (error.message || "Unknown error")
      );
    } finally {
      setDeletingFileId(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setFileToDelete(null);
  };

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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý Tài liệu
        </h2>
        <button
          onClick={() => setShowUploadPopup(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] transition-all cursor-pointer"
        >
          Tải lên Tài liệu
        </button>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên tệp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tải lên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kích thước
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Chưa có tài liệu nào
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 bg-red-100 rounded flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                          >
                            {doc.file_name}
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doc.status === "Đang tải lên..." ? (
                      <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        <svg
                          className="animate-spin h-3 w-3"
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
                        Đang tải lên...
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {doc.status || "Đã tải lên"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => window.open(doc.file_url, "_blank")}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Tải xuống"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        showDeleteConfirmation(doc.id, doc.file_name)
                      }
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Xóa"
                      disabled={deletingFileId === doc.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Document Popup */}
      {showUploadPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Tải tài liệu để huấn luyện chatbot
              </h3>
              <button
                onClick={() => setShowUploadPopup(false)}
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

            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  Tải về tập tin mẫu, thêm các câu hỏi và trả lời, sau đó tải
                  lên (tối đa 100MB)
                </p>
                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                  Tải xuống tệp mẫu
                </button>
              </div>
            </div>

            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <svg
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 48 48"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    />
                  </svg>
                </div>
                <p className="text-lg text-gray-600 mb-2">
                  Bấm vào để tải lên hoặc kéo thả tệp vào đây
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Hỗ trợ: PDF, DOC, DOCX, TXT (tối đa 100MB)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md cursor-pointer text-sm font-medium"
                >
                  Chọn tệp
                </label>
              </div>
            </div>

            <div className="mt-6 text-center">
              {/* <p className="text-xs text-gray-500">
                Sẽ đóng mỗi trang trên tổng số 1
              </p> */}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
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
                Bạn có chắc chắn muốn xóa tài liệu{" "}
                <span className="font-semibold text-gray-900">
                  "{fileToDelete?.name}"
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
                disabled={deletingFileId !== null}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteFile}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={deletingFileId !== null}
              >
                {deletingFileId ? (
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
    </div>
  );
}

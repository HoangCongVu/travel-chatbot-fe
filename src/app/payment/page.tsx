"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentServices, Payment } from "@/services/paymentServices";
import {
  CheckCircle,
  Clock,
  XCircle,
  QrCode,
  Copy,
  CheckCheck,
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      setError("Payment ID không tồn tại");
      setLoading(false);
      return;
    }

    loadPaymentDetails();
  }, [paymentId]);

  // Polling effect - check status every 5 seconds
  useEffect(() => {
    if (!paymentId || !payment) return;

    // Only poll if payment status is not success
    if (
      payment.payment_status === "success" ||
      payment.payment_status === "completed"
    ) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    const interval = setInterval(async () => {
      try {
        const statusData = await paymentServices.checkPaymentStatus(paymentId);

        // Update status message
        setStatusMessage(statusData.message);

        // Check if payment is successful
        // API can return payment_id: "success" or payment_status: "success"
        const isSuccess =
          statusData.payment_id === "success" ||
          statusData.payment_status === "success" ||
          statusData.payment_status === "completed";

        if (isSuccess) {
          setIsPolling(false);
          // Update payment object to success status
          setPayment((prev) =>
            prev ? { ...prev, payment_status: "success" } : prev
          );
          setStatusMessage("Thanh toán thành công!");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [paymentId, payment]);

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);
      const data = await paymentServices.getPaymentById(paymentId!);
      setPayment(data);

      // Set initial status message
      if (data.payment_status === "pending") {
        setStatusMessage("Đang chờ thanh toán");
      } else if (
        data.payment_status === "success" ||
        data.payment_status === "completed"
      ) {
        setStatusMessage("Thanh toán thành công!");
      }
    } catch (err: any) {
      console.error("Error loading payment:", err);
      setError(
        err.response?.data?.detail || "Không thể tải thông tin thanh toán"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTransactionId = () => {
    if (payment?.transaction_id) {
      navigator.clipboard.writeText(payment.transaction_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-full">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Chờ thanh toán</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Đã thanh toán</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-full">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Thất bại</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{status}</span>
          </div>
        );
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Đang tải thông tin thanh toán...
          </p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-6">
            {error || "Không tìm thấy thông tin thanh toán"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Success UI - completely different layout
  if (
    payment.payment_status === "success" ||
    payment.payment_status === "completed"
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Header */}
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <div
                  className="text-4xl font-bold cursor-pointer"
                  onClick={() => router.push("/")}
                >
                  <span className="text-blue-500">Travel</span>
                  <span className="text-gray-700">AI</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="pt-20">
          <div className="max-w-3xl mx-auto px-4 py-12">
            {/* Success Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-full p-6 animate-bounce">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-3">
                  Thanh toán thành công!
                </h1>
                <p className="text-green-100 text-lg">{statusMessage}</p>
              </div>

              <div className="p-8">
                {/* Amount Paid */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 text-center border-2 border-green-200">
                  <p className="text-gray-600 text-sm mb-2">
                    Số tiền đã thanh toán
                  </p>
                  <p className="text-5xl font-bold text-green-600 mb-2">
                    {formatAmount(payment.amount)}
                  </p>
                  <p className="text-green-700 font-semibold">✓ Đã xác nhận</p>
                </div>

                {/* Payment Details */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Thông tin giao dịch
                  </h3>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Mã giao dịch</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-800">
                        {payment.transaction_id}
                      </code>
                      <button
                        onClick={handleCopyTransactionId}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy"
                      >
                        {copied ? (
                          <CheckCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Phương thức</span>
                    <span className="font-semibold text-gray-800 uppercase">
                      {payment.payment_method}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Booking ID</span>
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-800">
                      {payment.booking_id}
                    </code>
                  </div>

                  {payment.paid_at && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">
                        Thời gian thanh toán
                      </span>
                      <span className="font-semibold text-green-600">
                        {new Date(payment.paid_at).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-green-800 mb-2">
                        Đặt tour thành công!
                      </h4>
                      <p className="text-green-700 text-sm mb-2">
                        Cảm ơn bạn đã đặt tour. Chúng tôi đã nhận được thanh
                        toán của bạn.
                      </p>
                      <p className="text-green-700 text-sm">
                        Thông tin chi tiết về chuyến đi sẽ được gửi qua email và
                        có thể xem trong phần "Đơn đặt tour" của bạn.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push("/bookings")}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Xem đơn đặt tour</span>
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-gray-600">
                Nếu có thắc mắc, vui lòng liên hệ{" "}
                <span className="text-green-600 font-semibold">
                  hotline: 1900-xxxx
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending Payment UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <div
                className="text-4xl font-bold cursor-pointer"
                onClick={() => router.push("/")}
              >
                <span className="text-blue-500">Travel</span>
                <span className="text-gray-700">AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Payment Status Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Thanh toán</h1>
                  <p className="text-blue-100">
                    Quét mã QR để hoàn tất thanh toán
                  </p>
                </div>
                {getStatusBadge(payment.payment_status)}
              </div>
            </div>

            <div className="p-8">
              {/* Amount */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <p className="text-gray-600 text-sm mb-2">
                  Số tiền cần thanh toán
                </p>
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {formatAmount(payment.amount)}
                </p>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                    payment.payment_status === "success" ||
                    payment.payment_status === "completed"
                      ? "bg-green-50 border-2 border-green-200"
                      : "bg-blue-50 border-2 border-blue-200"
                  }`}
                >
                  {payment.payment_status === "success" ||
                  payment.payment_status === "completed" ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 animate-pulse" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        payment.payment_status === "success" ||
                        payment.payment_status === "completed"
                          ? "text-green-800"
                          : "text-blue-800"
                      }`}
                    >
                      {statusMessage}
                    </p>
                    {isPolling && (
                      <p className="text-sm text-gray-600 mt-1">
                        Đang kiểm tra trạng thái thanh toán...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* QR Code */}
              {payment.payment_url && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <QrCode className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">
                      Mã QR thanh toán
                    </h2>
                  </div>
                  <div className="bg-white border-4 border-blue-100 rounded-2xl p-6 flex justify-center">
                    <img
                      src={payment.payment_url}
                      alt="QR Code"
                      className="w-80 h-80 object-contain"
                    />
                  </div>
                  <p className="text-center text-gray-600 mt-4">
                    Sử dụng ứng dụng ngân hàng để quét mã QR
                  </p>
                </div>
              )}

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Chi tiết giao dịch
                </h3>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Mã giao dịch</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-800">
                      {payment.transaction_id}
                    </code>
                    <button
                      onClick={handleCopyTransactionId}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copied ? (
                        <CheckCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Phương thức</span>
                  <span className="font-semibold text-gray-800 uppercase">
                    {payment.payment_method}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Booking ID</span>
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-800">
                    {payment.booking_id}
                  </code>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Ngày tạo</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(payment.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>

                {payment.paid_at && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Ngày thanh toán</span>
                    <span className="font-semibold text-green-600">
                      {new Date(payment.paid_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              {payment.payment_status === "pending" && (
                <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
                  <h4 className="font-bold text-yellow-800 mb-3">
                    Hướng dẫn thanh toán
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-yellow-700 text-sm">
                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                    <li>Chọn tính năng quét mã QR</li>
                    <li>Quét mã QR phía trên</li>
                    <li>Xác nhận thông tin và hoàn tất thanh toán</li>
                    <li>
                      Chờ hệ thống cập nhật trạng thái (có thể mất vài phút)
                    </li>
                  </ol>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push("/bookings")}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Xem đơn đặt tour
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Về trang chủ
                </button>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-gray-600">
              Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ{" "}
              <span className="text-blue-600 font-semibold">
                hotline: 1900-xxxx
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

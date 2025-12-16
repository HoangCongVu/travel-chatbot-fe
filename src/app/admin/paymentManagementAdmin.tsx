"use client";

import { useState, useEffect } from "react";
import {
  paymentServices,
  PaymentStatistics,
  TotalSuccessAmountResponse,
} from "@/services/paymentServices";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function PaymentManagementAdminComponent() {
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [totalSuccessAmount, setTotalSuccessAmount] =
    useState<TotalSuccessAmountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch payment statistics from API
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [statsData, totalAmountData] = await Promise.all([
        paymentServices.getStatistics(),
        paymentServices.getTotalSuccessAmount(),
      ]);
      setStatistics(statsData);
      setTotalSuccessAmount(totalAmountData);
      setError("");
    } catch (error: any) {
      console.error("Error fetching payment statistics:", error);
      setError(error.message || "Lỗi khi tải thống kê thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Colors for different payment statuses
  const COLORS = {
    pending: "#FFA500", // Orange
    processing: "#3B82F6", // Blue
    success: "#10B981", // Green
    failed: "#EF4444", // Red
    refunded: "#8B5CF6", // Purple
  };

  // Get status text in Vietnamese
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ thanh toán";
      case "processing":
        return "Đang xử lý";
      case "success":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  // Prepare data for charts
  const getPieChartData = () => {
    if (!statistics) return [];
    return [
      { name: "Chờ thanh toán", value: statistics.pending, status: "pending" },
      {
        name: "Đang xử lý",
        value: statistics.processing,
        status: "processing",
      },
      { name: "Thành công", value: statistics.success, status: "success" },
      { name: "Thất bại", value: statistics.failed, status: "failed" },
      { name: "Đã hoàn tiền", value: statistics.refunded, status: "refunded" },
    ].filter((item) => item.value > 0);
  };

  const getBarChartData = () => {
    if (!statistics) return [];
    return [
      {
        name: "Chờ thanh toán",
        count: statistics.pending,
        fill: COLORS.pending,
      },
      {
        name: "Đang xử lý",
        count: statistics.processing,
        fill: COLORS.processing,
      },
      { name: "Thành công", count: statistics.success, fill: COLORS.success },
      { name: "Thất bại", count: statistics.failed, fill: COLORS.failed },
      {
        name: "Đã hoàn tiền",
        count: statistics.refunded,
        fill: COLORS.refunded,
      },
    ];
  };

  // Calculate total payments
  const getTotalPayments = () => {
    if (!statistics) return 0;
    return (
      statistics.pending +
      statistics.processing +
      statistics.success +
      statistics.failed +
      statistics.refunded
    );
  };

  // Calculate success rate
  const getSuccessRate = () => {
    const total = getTotalPayments();
    if (total === 0 || !statistics) return 0;
    return ((statistics.success / total) * 100).toFixed(1);
  };

  // Format currency to VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">
          Đang tải thống kê thanh toán...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchStatistics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Không có dữ liệu thống kê</p>
      </div>
    );
  }

  const pieChartData = getPieChartData();
  const barChartData = getBarChartData();
  const totalPayments = getTotalPayments();
  const successRate = getSuccessRate();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý Thanh toán
          </h1>
          <p className="text-gray-600 mt-1">
            Thống kê và biểu đồ trạng thái thanh toán
          </p>
        </div>
        <button
          onClick={fetchStatistics}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Làm mới
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalPayments}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Thành công</p>
              <p className="text-2xl font-bold text-green-600">
                {statistics.success}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-orange-600">
                {statistics.pending}
              </p>
            </div>
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tỷ lệ thành công</p>
              <p className="text-2xl font-bold text-purple-600">
                {successRate}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg p-6 border-l-4 border-emerald-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1 font-medium">
                Tổng doanh thu
              </p>
              <p className="text-xl font-bold text-white">
                {totalSuccessAmount
                  ? formatCurrency(totalSuccessAmount.total_success_amount)
                  : "0 ₫"}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>

      {/* Detailed Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="font-semibold text-orange-800">Chờ thanh toán</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {statistics.pending}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <RefreshCcw className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-800">Đang xử lý</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {statistics.processing}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">Thành công</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {statistics.success}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800">Thất bại</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{statistics.failed}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-purple-800">Đã hoàn tiền</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {statistics.refunded}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Biểu đồ tròn - Phân bố trạng thái
          </h2>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.status as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Không có dữ liệu để hiển thị
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Biểu đồ cột - Số lượng theo trạng thái
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Số lượng">
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

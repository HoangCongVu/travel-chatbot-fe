"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { adminServices, tokenManager } from "@/services/adminServices";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = tokenManager.getToken();
      const userRole = localStorage.getItem("role"); // Changed from "user_role" to "role"
      console.log("StaffLayout - token:", !!token, "role:", userRole);
      setLoading(false);

      if (!token) {
        router.push("/staff/login");
      } else if (userRole !== "staff") {
        // If role is not staff, redirect to staff login
        router.push("/staff/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    adminServices.logout();
    localStorage.removeItem("role"); // Changed from "user_role" to "role"
    localStorage.setItem("staff_logout_success", "true");
    router.push("/staff/login");
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-4xl font-bold flex items-center gap-2">
                <span className="text-blue-500">TravelAI</span>
                <span className="text-gray-700">Staff</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xl text-gray-500">Welcome, Staff</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => router.push("/staff/chats")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  isActive("/staff/chats")
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Chat Management
              </button>

              <button
                onClick={() => router.push("/staff/tours")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  isActive("/staff/tours")
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Tours
              </button>

              <button
                onClick={() => router.push("/staff/documents")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  isActive("/staff/documents")
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Documents
              </button>

              <button
                onClick={() => router.push("/staff/settings")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  isActive("/staff/settings")
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </button>

              <button
                onClick={() => router.push("/staff/bookings")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  isActive("/staff/bookings")
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Bookings
              </button>

              <button
                onClick={() => router.push("/staff/payments")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  isActive("/staff/payments")
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Payments
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

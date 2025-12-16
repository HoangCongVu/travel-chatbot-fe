"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/services/adminServices";

export default function StaffPage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and redirect
    const checkAuth = () => {
      const token = tokenManager.getToken();

      if (!token) {
        router.push("/staff/login");
      } else {
        // Redirect to chats page by default for staff
        router.push("/staff/chats");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
}

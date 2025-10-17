"use client";

import { adminServices } from "@/services/adminServices";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Remove admin token
    adminServices.logout();

    console.log("✅ Admin logged out successfully");

    // Redirect to login page
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors ${className}`}
    >
      Đăng Xuất
    </button>
  );
}

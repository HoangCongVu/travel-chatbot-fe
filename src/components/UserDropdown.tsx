"use client";

import { useState, useEffect, useRef } from "react";
import { userTokenManager } from "@/services/authServices";
import { ClipboardList, LogOut, Settings } from "lucide-react";

interface UserDropdownProps {
  userEmail: string;
  onLogout: () => void;
}

export default function UserDropdown({
  userEmail,
  onLogout,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-400 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {userEmail.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="font-medium">{userEmail}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userEmail}</p>
            <p className="text-xs text-gray-500">Thành viên</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              // Navigate to profile (you can implement this later)
              console.log("Navigate to profile");
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              // Navigate to bookings (you can implement this later)
              console.log("Navigate to bookings");
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Đặt chỗ của tôi</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              // Navigate to admin (check if user is admin)
              window.location.href = "/admin";
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Quản trị</span>
          </button>

          <hr className="border-gray-100 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              // Xóa cookie user_token
              userTokenManager.removeToken();
              // Gọi callback logout (có thể redirect hoặc update UI)
              onLogout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}

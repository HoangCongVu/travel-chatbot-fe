"use client";

import { useState, useEffect } from "react";
import CreateTourPopup from "./createTour";
import { useRouter } from "next/navigation";
import { adminServices, tokenManager } from "@/services/adminServices";
import TourAdminComponent from "./tourAdmin";
import DocumentAdminComponent from "./documentAdmin";
import UserManagementAdminComponent from "./userManagementAdmin";

type TabType = "users" | "chats" | "settings" | "documents" | "tours";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status using token from cookies via tokenManager
    const checkAuth = () => {
      const token = tokenManager.getToken();
      setLoading(false);

      if (!token) {
        router.push("admin/login");
      } else {
        // Successfully authenticated, ensure default tab is set
        console.log("✅ Admin authenticated, showing admin panel");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    // Use adminServices logout to properly clean up
    adminServices.logout();
    router.push("admin/login");
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
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold flex items-center gap-2">
                <span className="text-blue-500">TravelAI</span>
                <span className="text-gray-700">Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "users"
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                User Management
              </button>

              <button
                onClick={() => setActiveTab("tours")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "tours"
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
                onClick={() => setActiveTab("chats")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "chats"
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
                onClick={() => setActiveTab("documents")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "documents"
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
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === "settings"
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
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow min-h-full">
            {activeTab === "users" && <UserManagementAdminComponent />}
            {activeTab === "chats" && <ChatManagement />}
            {activeTab === "settings" && <Settings />}
            {activeTab === "documents" && <DocumentAdminComponent />}
            {activeTab === "tours" && <TourAdminComponent />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat Management Component
function ChatManagement() {
  const [conversations] = useState([
    {
      id: 1,
      user: "John Doe",
      lastMessage: "Can you help me plan a trip to Vietnam?",
      timestamp: "2024-10-10 14:30",
      status: "Active",
    },
    {
      id: 2,
      user: "Jane Smith",
      lastMessage: "What are the best hotels in Ho Chi Minh City?",
      timestamp: "2024-10-10 13:15",
      status: "Completed",
    },
    {
      id: 3,
      user: "Bob Johnson",
      lastMessage: "I need flight information",
      timestamp: "2024-10-10 12:00",
      status: "Active",
    },
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Chat Management</h2>
        <div className="flex space-x-3">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Export Chats
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    {conversation.user}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      conversation.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {conversation.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {conversation.lastMessage}
                </p>
                <p className="text-gray-400 text-xs">
                  {conversation.timestamp}
                </p>
              </div>
              <div className="ml-4 flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900 text-sm">
                  View
                </button>
                <button className="text-gray-600 hover:text-gray-900 text-sm">
                  Archive
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Settings Component
function Settings() {
  const [settings, setSettings] = useState({
    botName: "Travel Assistant",
    welcomeMessage:
      "Hello! I'm here to help you plan your perfect trip to Vietnam.",
    maxConversationLength: 50,
    enableLogging: true,
    autoResponse: false,
  });

  const handleSettingChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Chatbot Settings
      </h2>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bot Name
          </label>
          <input
            type="text"
            value={settings.botName}
            onChange={(e) => handleSettingChange("botName", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Welcome Message
          </label>
          <textarea
            value={settings.welcomeMessage}
            onChange={(e) =>
              handleSettingChange("welcomeMessage", e.target.value)
            }
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Conversation Length
          </label>
          <input
            type="number"
            value={settings.maxConversationLength}
            onChange={(e) =>
              handleSettingChange(
                "maxConversationLength",
                parseInt(e.target.value)
              )
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableLogging"
              checked={settings.enableLogging}
              onChange={(e) =>
                handleSettingChange("enableLogging", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="enableLogging"
              className="ml-2 block text-sm text-gray-900"
            >
              Enable conversation logging
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoResponse"
              checked={settings.autoResponse}
              onChange={(e) =>
                handleSettingChange("autoResponse", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="autoResponse"
              className="ml-2 block text-sm text-gray-900"
            >
              Enable auto responses for common questions
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { TourForm } from "./components";

interface CreateTourPopupProps {
  onClose: () => void;
}

export default function CreateTourPopup({ onClose }: CreateTourPopupProps) {
  const handleSuccess = () => {
    // Close popup when tour creation is successful
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm"
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

      {/* Form Content */}
      <div className="p-0">
        <TourForm onSuccess={handleSuccess} isEdit={false} />
      </div>
    </div>
  );
}

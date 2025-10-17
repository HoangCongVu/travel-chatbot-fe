import axios from "axios";
import { UUID } from "crypto";
import { tokenManager } from "./adminServices";

// Helper function to generate UUID
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const createTourServices = {
  // Upload image API
  uploadImage: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload-files/uploadImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...tokenManager.getAuthHeader(),
          },
        }
      );

      return {
        success: true,
        url: response.data.url,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Upload image error:", error);
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to upload image",
      };
    }
  },

  // Main tour creation API
  createTour: async (tourData: {
    tour_name: string;
    tour_type_id: number;
    days: number;
    description: string;
    highlight: string;
    itinerary_url: string;
    image_url: string;
    promotion_info: string;
    price_type: string;
    price: string;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tours/create`,
        tourData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Create tour error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create tour",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Main tour UPDATE API
  updateTour: async (
    tourId: string,
    tourData: {
      tour_name: string;
      tour_type_id: number;
      days: number;
      description: string;
      highlight: string;
      itinerary_url: string;
      image_url: string;
      promotion_info: string;
      price_type: string;
      price: string;
    }
  ): Promise<any> => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tours/update/${tourId}`,
        tourData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Update tour error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update tour",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Tour destinations API
  createTourDestination: async (destinationData: {
    tour_id: UUID;
    destination_name: string;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tour-destinations/create`,
        destinationData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Create destination error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create destination",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // UPDATE Tour destinations API
  updateTourDestination: async (
    destinationId: UUID,
    destinationData: {
      tour_id: UUID;
      destination_name: string;
    }
  ): Promise<any> => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tour-destinations/update/${destinationId}`,
        destinationData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Update destination error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update destination",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Tour departures API
  createTourDeparture: async (departureData: {
    tour_id: UUID;
    departure_name: string;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tour-departures/create`,
        departureData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Create departure error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create departure",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // UPDATE Tour departures API
  updateTourDeparture: async (
    departureId: UUID,
    departureData: {
      tour_id: UUID;
      departure_name: string;
    }
  ): Promise<any> => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tour-departures/update/${departureId}`,
        departureData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Update departure error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update departure",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Price by date API
  createPriceByDate: async (priceData: {
    tour_id: UUID;
    date: Date;
    price: number;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/price-by-dates/create`,
        priceData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Create price by date error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create price by date",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // UPDATE Price by date API
  updatePriceByDate: async (
    priceId: UUID,
    priceData: {
      tour_id: UUID;
      date: Date;
      price: number;
    }
  ): Promise<any> => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/price-by-dates/update/${priceId}`,
        priceData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Update price by date error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update price by date",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Price by package API
  createPriceByPackage: async (priceData: {
    tour_id: UUID;
    package_name: string;
    price: number;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/price-by-packages/create`,
        priceData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Create price by package error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create price by package",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // UPDATE Price by package API
  updatePriceByPackage: async (
    priceId: UUID,
    priceData: {
      tour_id: UUID;
      package_name: string;
      price: number;
    }
  ): Promise<any> => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/price-by-packages/update/${priceId}`,
        priceData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Update price by package error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update price by package",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Recurring schedules API
  createRecurringSchedule: async (scheduleData: {
    schedule_id: UUID;
    recurrence_type: string;
    start_date: Date;
    end_date: Date;
    weekdays?: string[] | null;
  }): Promise<any> => {
    try {
      const payload = {
        ...scheduleData,
        // Convert weekdays from strings to numbers if needed
        weekdays:
          scheduleData.weekdays?.map((day) => {
            const dayMap: Record<string, number> = {
              mon: 1,
              tue: 2,
              wed: 3,
              thu: 4,
              fri: 5,
              sat: 6,
              sun: 0,
            };
            return typeof day === "string" ? dayMap[day] || 0 : day;
          }) || [],
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recurring-schedules/create`,
        payload,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Create recurring schedule error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create recurring schedule",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // UPDATE Recurring schedules API
  updateRecurringSchedule: async (
    scheduleId: UUID,
    scheduleData: {
      schedule_id: UUID;
      recurrence_type: string;
      start_date: Date;
      end_date: Date;
      weekdays?: string[] | null;
    }
  ): Promise<any> => {
    try {
      const payload = {
        ...scheduleData,
        // Convert weekdays from strings to numbers if needed
        weekdays:
          scheduleData.weekdays?.map((day) => {
            const dayMap: Record<string, number> = {
              mon: 1,
              tue: 2,
              wed: 3,
              thu: 4,
              fri: 5,
              sat: 6,
              sun: 0,
            };
            return typeof day === "string" ? dayMap[day] || 0 : day;
          }) || [],
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recurring-schedules/update/${scheduleId}`,
        payload,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Update recurring schedule error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update recurring schedule",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Specific departures API
  createSpecificDeparture: async (departureData: {
    schedule_id: UUID;
    date: Date;
  }): Promise<any> => {
    try {
      const payload = {
        ...departureData,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/specific-departures/create`,
        payload,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Create specific departure error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create specific departure",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // UPDATE Specific departures API
  updateSpecificDeparture: async (
    departureId: UUID,
    departureData: {
      schedule_id: UUID;
      date: Date;
    }
  ): Promise<any> => {
    try {
      const payload = {
        ...departureData,
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/specific-departures/update/${departureId}`,
        payload,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Update specific departure error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update specific departure",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Departure schedules API (link tours with schedules)
  createDepartureSchedule: async (scheduleData: {
    tour_id: UUID;
    schedule_type: string; // "specific" | "recurring"
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/departure-schedules/create`,
        scheduleData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Create departure schedule error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create departure schedule",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // UPDATE Departure schedules API
  updateDepartureSchedule: async (
    scheduleId: UUID,
    scheduleData: {
      tour_id: UUID;
      schedule_type: string; // "specific" | "recurring"
    }
  ): Promise<any> => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/departure-schedules/update/${scheduleId}`,
        scheduleData,
        {
          headers: tokenManager.getAuthHeader(),
        }
      );
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error("Update departure schedule error:", error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update departure schedule",
        success: false,
        status: error.response?.status,
      };
    }
  },

  // Generic API method for other endpoints
  post: async (endpoint: string, data?: any): Promise<any> => {
    try {
      const response = await axios.post(endpoint, data);
      return {
        data: response.data,
        success: true,
        status: response.status,
        id: response.data?.id,
      };
    } catch (error: any) {
      console.error(`POST ${endpoint} error:`, error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "API request failed",
        success: false,
        status: error.response?.status,
      };
    }
  },

  get: async (endpoint: string, params?: any): Promise<any> => {
    try {
      const response = await axios.get(endpoint, { params });
      return {
        data: response.data,
        success: true,
        status: response.status,
      };
    } catch (error: any) {
      console.error(`GET ${endpoint} error:`, error);
      return {
        error:
          error.response?.data?.message ||
          error.message ||
          "API request failed",
        success: false,
        status: error.response?.status,
      };
    }
  },
};

import axios from "axios";

// Helper function to generate UUID
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const createTourServices = {
  // Main tour creation API
  createTour: async (tourData: {
    tour_name: string;
    tour_type_id: number;
    days: number;
    description?: string;
    highlight?: string;
    itinerary_url?: string;
    image_url?: string;
    promotion_info?: string;
    price_type: string;
    price?: number;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tours/create`,
        tourData
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

  // Tour destinations API
  createTourDestination: async (destinationData: {
    tour_id: number | string;
    destination_name: string;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tour-destinations/create`,
        destinationData
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

  // Tour departures API
  createTourDeparture: async (departureData: {
    tour_id: number | string;
    departure_name: string;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tour-departures/create`,
        departureData
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

  // Price by date API
  createPriceByDate: async (priceData: {
    tour_id: number | string;
    date: Date | string;
    price: number;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/price-by-dates/create`,
        priceData
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

  // Price by package API
  createPriceByPackage: async (priceData: {
    tour_id: number | string;
    package_name: string;
    price: number;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/price-by-packages/create`,
        priceData
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

  // Recurring schedules API
  createRecurringSchedule: async (scheduleData: {
    schedule_id: string;
    recurrence_type: string;
    start_date: Date | string;
    end_date: Date | string;
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
        payload
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

  // Specific departures API
  createSpecificDeparture: async (departureData: {
    schedule_id: string;
    date: Date | string;
  }): Promise<any> => {
    try {
      const payload = {
        ...departureData,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/specific-departures/create`,
        payload
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

  // Departure schedules API (link tours with schedules)
  createDepartureSchedule: async (scheduleData: {
    tour_id: number | string;
    schedule_type: string; // "specific" | "recurring"
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/departure-schedules/create`,
        scheduleData
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

import axios from "axios";
import { tokenManager } from "./adminServices";

export const tourServices = {
  fetchAllTours: async (page = 1, limit = 10) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/search-tours/tourpage?page=${page}&limit=${limit}`;
    console.log(`🔗 API URL: ${url}`);

    const response = await axios.get(url);
    console.log(`📡 Raw API Response:`, response.data);

    return response.data;
  },

  fetchToursByType: async (tourTypeId: number, page = 1, limit = 10) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/search-tours/search-by-type/${tourTypeId}?page=${page}&limit=${limit}`;
    console.log(`🔗 Tour Type API URL: ${url}`);

    const response = await axios.get(url);
    console.log(`📡 Tour Type API Response:`, response.data);

    return response.data;
  },

  fetchTourById: async (tourId: string) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tours/${tourId}`
    );
    return response.data;
  },

  deleteTour: async (tourId: string) => {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tours/delete/${tourId}`,
      {
        headers: tokenManager.getAuthHeader(),
      }
    );
    return response.data;
  },
};

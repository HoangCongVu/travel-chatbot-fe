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

  searchToursByFields: async (params: {
    tour_type_id?: number;
    destination?: string;
    departure?: string;
    target_date?: string;
    page?: number;
    limit?: number;
  }) => {
    const { page = 1, limit = 10, ...searchParams } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    if (searchParams.tour_type_id) {
      queryParams.append("tour_type_id", searchParams.tour_type_id.toString());
    }
    if (searchParams.destination) {
      queryParams.append("destination", searchParams.destination);
    }
    if (searchParams.departure) {
      queryParams.append("departure", searchParams.departure);
    }
    if (searchParams.target_date) {
      queryParams.append("target_date", searchParams.target_date);
    }

    const url = `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/search-tours/search-by-fields/?${queryParams.toString()}`;
    console.log(`🔗 Search Tours API URL: ${url}`);

    const response = await axios.get(url);
    console.log(`📡 Search Tours API Response:`, response.data);

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

import axios from "axios";

export const tourServices = {
  fetchAllTours: async (page = 1, limit = 5) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/search-tours/tourpage?page=${page}&limit=${limit}`
    );
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
      `${process.env.NEXT_PUBLIC_API_URL}/api/tours/${tourId}`
    );
    return response.data;
  },
};

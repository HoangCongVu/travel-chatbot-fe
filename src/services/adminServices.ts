import axios from "axios";
import { UUID } from "crypto";

export const adminServices = {
  fetchAllUsers: async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users`
    );
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`
    );
    return response.data;
  },
  fetchAllFiles: async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/files`
    );
    return response.data;
  },
  deleteFile: async (fileId: string) => {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/files/${fileId}`
    );
    return response.data;
  },
  uploadFileAgent: async (file: File, adminId: UUID) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("admin_id", adminId);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload-files-agent/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(response.data.message);
      return response.data;
    } catch (error: any) {
      alert(
        "Upload thất bại: " + (error.response?.data?.detail || error.message)
      );
      throw error;
    }
  },
};

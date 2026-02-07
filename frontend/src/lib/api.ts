import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rentzy_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Let the browser set Content-Type with boundary for FormData (required for file uploads)
  if (config.data instanceof FormData) {
    delete (config.headers as Record<string, unknown>)["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("rentzy_refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
          localStorage.setItem("rentzy_token", data.access_token);
          localStorage.setItem("rentzy_refresh_token", data.refresh_token);
          if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem("rentzy_token");
          localStorage.removeItem("rentzy_refresh_token");
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signUp: (email: string, password: string, fullName: string) => api.post("/auth/signup", { email, password, fullName }),
  signIn: (email: string, password: string) => api.post("/auth/signin", { email, password }),
  signOut: () => api.post("/auth/signout"),
  getMe: () => api.get("/auth/me"),
  refresh: (refreshToken: string) => api.post("/auth/refresh", { refresh_token: refreshToken }),
};

export const usersAPI = {
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  updateProfile: (data: any) => api.patch("/users/me", data),
  getMyItems: () => api.get("/users/me/items"),
  getSavedItems: () => api.get("/users/me/saved"),
  toggleSaveItem: (itemId: string) => api.post(`/users/me/saved/${itemId}`),
};

export const itemsAPI = {
  getItems: (params?: any) => api.get("/items", { params }),
  getItem: (itemId: string) => api.get(`/items/${itemId}`),
  createItem: (data: any) => api.post("/items", data),
  updateItem: (itemId: string, data: any) => api.patch(`/items/${itemId}`, data),
  deleteItem: (itemId: string) => api.delete(`/items/${itemId}`),
  incrementViews: (itemId: string) => api.post(`/items/${itemId}/view`),
};

export const rentalsAPI = {
  getRentals: (role: "renter" | "owner" = "renter") => api.get("/rentals", { params: { role } }),
  getRental: (rentalId: string) => api.get(`/rentals/${rentalId}`),
  createRental: (data: { item_id: string; start_date: string; end_date: string; message?: string }) => api.post("/rentals", data),
  updateRentalStatus: (rentalId: string, status: string, response?: string) => api.patch(`/rentals/${rentalId}/status`, { status, response }),
};

export const messagesAPI = {
  getConversations: () => api.get("/messages/conversations"),
  getConversation: (conversationId: string) => api.get(`/messages/conversations/${conversationId}`),
  startConversation: (participantId: string, message: string, itemId?: string) => api.post("/messages/conversations", { participant_id: participantId, message, item_id: itemId }),
  sendMessage: (conversationId: string, content: string) => api.post(`/messages/conversations/${conversationId}/messages`, { content }),
};

export const reviewsAPI = {
  getUserReviews: (userId: string) => api.get(`/reviews/user/${userId}`),
  getItemReviews: (itemId: string) => api.get(`/reviews/item/${itemId}`),
  createReview: (data: { rental_request_id: string; rating: number; comment?: string }) => api.post("/reviews", data),
};

export const notificationsAPI = {
  getNotifications: (params?: { page?: number; limit?: number }) => api.get("/notifications", { params }),
  markAsRead: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  deleteNotification: (notificationId: string) => api.delete(`/notifications/${notificationId}`),
};

// Do not set Content-Type for FormData — axios must set multipart/form-data with boundary
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload/image", formData);
  },
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return api.post("/upload/images", formData);
  },
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/upload/avatar", formData);
  },
  deleteImage: (fileName: string) => api.delete("/upload/image", { data: { fileName } }),
};

export default api;

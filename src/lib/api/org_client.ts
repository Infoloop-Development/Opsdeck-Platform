import axios, { AxiosInstance, AxiosResponse } from "axios";
import { getToken } from "../../utils/authStorage";
import { message } from "antd";
import { accessTokenKey } from "@/utils/constants";

const rawUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

let API_URL = "/api";

if (rawUrl) {
  const trimmed = rawUrl.replace(/\/+$/, "");
  API_URL = trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const tokenFromLocalStorage =
      typeof window !== "undefined"
        ? localStorage.getItem(accessTokenKey)
        : null;

    const token = tokenFromLocalStorage || getToken();

    if (token) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }

      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const errorMessage = error?.response?.data?.error;

    if (errorMessage === "Invalid or expired token") {
      message.error("Session expired. Please login again.");

      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  plan?: string;
  status?: string;
}

export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post("/superadmin/auth/login", credentials),

  logout: () =>
    api.post("/superadmin/auth/logout"),
};

export const organizationAPI = {
  create: <T = any>(payload: T) =>
    api.post("/superadmin/organizations", payload),

  list: (params: PaginationParams) =>
    api.get("/superadmin/organizations", { params }),

  updateStatus: <T = any>(id: string, payload: T) =>
    api.patch(`/superadmin/organizations/${id}`, payload),

  update: <T = any>(id: string, payload: T) =>
    api.patch(`/superadmin/organizations/${id}`, payload),

  delete: (id: string) =>
    api.delete(`/superadmin/organizations/${id}`),
};

export const plansAPI = {
  list: (params?: Record<string, any>) =>
    api.get("/superadmin/plans", { params }),

  create: <T = any>(data: T) =>
    api.post("/superadmin/plans", data),

  getById: (id: string) =>
    api.get(`/superadmin/plans/${id}`),

  update: <T = any>(id: string, data: T) =>
    api.patch(`/superadmin/plans/${id}`, data),

  delete: (id: string) =>
    api.delete(`/superadmin/plans/${id}`),
};

export default api;

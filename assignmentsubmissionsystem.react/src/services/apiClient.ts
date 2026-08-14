import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7013';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

export class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string) {
    const response = await this.instance.get<T>(endpoint);
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown) {
    const response = await this.instance.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown) {
    const response = await this.instance.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string) {
    const response = await this.instance.delete<T>(endpoint);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: unknown) {
    const response = await this.instance.patch<T>(endpoint, data);
    return response.data;
  }
}

export const apiClient = new ApiClient();

import { create } from 'zustand';
import type { AuthState, UserDto, LoginRequest, LoginResponse } from '@/types/auth';
import { apiClient } from '@/services/apiClient';

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  setUser: (user: UserDto | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  isLoading: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post<LoginResponse>(
        '/api/auth/login',
        credentials
      );

      // Map the response to UserDto
      const user: UserDto = {
        id: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
      };

      localStorage.setItem('authToken', response.token);
      set({
        user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const user = await apiClient.get<UserDto>('/api/auth/me');
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  },

  setUser: (user: UserDto | null) => {
    set({ user });
  },
}));

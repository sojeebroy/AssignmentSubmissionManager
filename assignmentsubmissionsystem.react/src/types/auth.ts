export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Teacher' | 'Student';
  token: string;
  expiresAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Teacher' | 'Student';
  createdAt?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  // allow Admin creation from the admin UI as well
  role: 'Admin' | 'Teacher' | 'Student';
}

export interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest } from '@/types/auth';
import { AxiosError } from 'axios';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const credentials: LoginRequest = { email, password };
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(
        (axiosError.response?.data as any)?.message || 
        'Invalid email or password'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        {/* Card */}
        <div className="card bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              AssignHub
            </h1>
            <p className="text-gray-600">Welcome back! Sign in to your account</p>
          </div>

          {error && (
            <div className="alert alert-danger mb-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
            <p className="font-semibold text-gray-900 mb-2">Demo Credentials:</p>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> admin@example.com
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Password:</span> password123
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-600">
          Don't have an account? <a href="/" className="text-blue-600 font-semibold hover:text-blue-700">Contact your administrator</a>
        </p>
      </div>
    </div>
  );
}

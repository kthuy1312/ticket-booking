import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/services/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const data = await authAPI.login({ email, password });
          localStorage.setItem('token', data.token);
          set({ token: data.token, user: data.user });
        } finally {
          set({ loading: false });
        }
      },

      register: async (payload) => {
        set({ loading: true });
        try {
          const data = await authAPI.register(payload);
          localStorage.setItem('token', data.token);
          set({ token: data.token, user: data.user });
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const user = await authAPI.me();
          set({ user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setTokenGetter, setUnauthorizedHandler } from '@/lib/apiClient';
import type { AuthSession, AuthUser } from '@/types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  /** true sau khi đã đọc phiên từ localStorage (tránh lệch HTML giữa server và client). */
  hydrated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setSession: ({ accessToken, user }) => set({ token: accessToken, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'brewlite-auth',
      version: 1,
      skipHydration: true, // hydrate thủ công trong Providers
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true });
      },
    },
  ),
);

// apiClient tự gắn JWT; token hết hạn (401) thì đăng xuất.
setTokenGetter(() => useAuthStore.getState().token);
setUnauthorizedHandler(() => useAuthStore.getState().logout());

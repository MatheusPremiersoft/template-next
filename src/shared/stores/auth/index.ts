import { AUTH_STORAGE_KEY } from '@/shared/constants';
import { getTokens, removeState } from '@/shared/helpers';
import { signIn } from '@/shared/services/auth';
import { t } from 'i18next';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthStore } from './props';

interface JWT {
  iat: number;
  exp: number;
}

const isTokenExpired = (token: string) => {
  try {
    const decoded: JWT = jwtDecode(token);

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    return currentTime > expirationTime;
  } catch (error) {
    // LogError('Error decoding token', error);

    return true;
  }
};

export const useAuthStore = create(
  persist<AuthStore>(
    set => ({
      token: null,
      refreshToken: null,

      user: null,

      isInitialized: false,
      initializeAuth: async () => {
        const { token, refreshToken } = getTokens();

        if (!token && !refreshToken) {
          set({ isInitialized: true });
          return;
        }

        if (refreshToken && isTokenExpired(refreshToken)) {
          removeState();
          window.location.replace('/sign-in?expired');
          return;
        }

        if (token) {
          const user = jwtDecode<any>(token);
          set({ user, token, refreshToken, isInitialized: true });
        }
      },

      signIn: async (credentials: { username: string; password: string }) => {
        try {
          const access = await signIn(credentials);
          const user = jwtDecode<any>(access.token);

          if (!user) {
            removeState();
            window.location.replace('/sign-in');

            return;
          }

          const username = user.sub || t('Anonymous');
          const name = user.name || t('Visitor');

          set({ user, token: access.token, refreshToken: access.refreshToken });
        } catch (error) {
          // LogError('Error signing in', error);
          throw error;
        }
      },
      signOut: () => {
        removeState();
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
    }
  )
);

useAuthStore.getState().initializeAuth();

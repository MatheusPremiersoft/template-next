import { User } from '@/shared/models/user';

export type AuthProviderProps = {
  children: React.ReactNode;
};

export type AuthContextProps = {
  user: User | null;
  setUser: (user: User) => void;
};

export interface AuthStore {
  token: string | null;
  refreshToken: string | null;

  user: User | null;

  isInitialized: boolean;
  initializeAuth: () => Promise<void>;

  signIn: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  signOut: () => void;
}

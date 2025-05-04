import { db, session } from '@/shared/helpers/database';
import { Collection } from '@/shared/models/collection';
import { User } from '@/shared/models/user';

export const getState = (): {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
} | null => {
  const stateStorage = db.get(Collection.AUTH, { universal: true });
  if (!stateStorage) return null;

  const { state } = JSON.parse(stateStorage);

  return state;
};

export const getToken = (): string | null => {
  const state = getState();
  if (!state) return null;

  return state.token;
};

export const getRefreshToken = (): string | null => {
  const state = getState();
  if (!state) return null;

  return state.refreshToken;
};

export const getTokens = (): {
  token: string | null;
  refreshToken: string | null;
} => {
  const state = getState();
  if (!state) return { token: null, refreshToken: null };

  return {
    token: state.token,
    refreshToken: state.refreshToken,
  };
};

export const removeState = (): void => {
  db.delete(Collection.AUTH, { universal: true });
  session.clear();
};

import { AUTH_STORAGE_KEY, DATABASE_STORAGE_KEY } from '@/shared/constants';

const path = (key: string, universal = false) => {
  if (universal) return `${DATABASE_STORAGE_KEY}:${key}`;

  const state_storage = localStorage.getItem(AUTH_STORAGE_KEY);
  const { state } = state_storage ? JSON.parse(state_storage) : { state: null };
  const user = state?.user ? state.user : null;
  const user_id = user?.userId ? user.userId : 'guest';

  return `${DATABASE_STORAGE_KEY}-[${user_id}]:${key}`;
};

const storageHandler = (storage: Storage) => ({
  get(key: string, { universal = false, format = false } = {}) {
    const item = storage.getItem(path(key, universal));
    if (!item) return null;
    return format ? JSON.parse(item) : item;
  },
  getData(key: string, data: string[], { universal = false } = {}) {
    return data.reduce((acc: { [key: string]: any }, variableName) => {
      const storageDataItem = storage.getItem(
        path(`${key}-${variableName}`, universal)
      );
      if (storageDataItem) {
        acc[variableName] = JSON.parse(storageDataItem);
      }
      return acc;
    }, {});
  },
  set(key: string, value: string, { universal = false } = {}) {
    storage.setItem(path(key, universal), value);
  },
  setData(
    key: string,
    data: Record<string, unknown>,
    { universal = false } = {}
  ) {
    Object.keys(data).forEach(variableName => {
      if (data[variableName as keyof typeof data]) {
        storage.setItem(
          path(`${key}-${variableName}`, universal),
          JSON.stringify(data[variableName as keyof typeof data])
        );
      }
    });
  },
  delete(key: string, { universal = false } = {}) {
    storage.removeItem(path(key, universal));
  },
  clear() {
    storage.clear();
  },
});

const db = storageHandler(localStorage);
const session = storageHandler(sessionStorage);

export { db, session };

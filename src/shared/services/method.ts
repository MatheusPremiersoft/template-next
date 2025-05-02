import { api } from '@/infrastructure/services/api';

const request = async (
  method: 'get' | 'post' | 'patch' | 'put',
  path: string,
  payload?: any
) => {
  const { data } = await api[method](path, payload ? payload : {});
  return data;
};

const get = (path: string, params?: any) => request('get', path, { params });
const post = (path: string, payload: any) => request('post', path, payload);
const patch = (path: string, payload: any) => request('patch', path, payload);
const put = (path: string, payload: any) => request('put', path, payload);

const fetcher = (path: string) => get(path);

const upload = async (path: string, formData: FormData) => {
  const { data } = await api.post(path, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const download = async (path: string, payload: any): Promise<Blob> => {
  const { data } = await api.post(path, payload, {
    responseType: 'blob',
  });
  return data;
};

const remove = async (path: string) => {
  await api.delete(path);
};

export { download, fetcher, get, patch, post, put, remove, upload };

import { post } from './method';

export const signIn = async (credentials: any): Promise<any> => {
  return post('auth/signin', credentials);
};

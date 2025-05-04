import { removeState } from '@/shared/helpers/auth';
import { LoggerError } from '@/shared/helpers/logger';
import { useAuthStore } from '@/shared/stores/auth';
import axios, { AxiosError, AxiosResponse } from 'axios';

// Extends the InternalAxiosRequestConfig type to include the _retry property
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const endpointsToIgnoreAuth = ['auth/login'];

export const createAxiosInstance = (path: string) => {
  const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/perfor-control/api/${path}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  let isRefreshing = false; // Flag to avoid multiple simultaneous token refreshes
  let failedQueue: any[] = []; // Queue for pending requests during the token refresh

  const processQueue = (
    error: AxiosError | null,
    token: string | null = null
  ) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Request interceptor to add token to the header
  instance.interceptors.request.use(
    async config => {
      const isEndpointToIgnoreAuth = endpointsToIgnoreAuth.some(endpoint =>
        config.url?.includes(endpoint)
      );

      if (isEndpointToIgnoreAuth) {
        return config; // Skip auth for specific endpoints
      }

      const token = useAuthStore.getState().token; // Get the token from the global state

      if (config.headers && token) {
        config.headers.Authorization = `Bearer ${token}`; // Add token to the header
      } else {
        window.location.replace('/sign-in'); // Redirect to login page if token is not present
      }

      return config;
    },
    (error: AxiosError) => {
      LoggerError('Error in request interceptor:', error);
      return Promise.reject(error); // Reject the request on error
    }
  );

  // Response interceptor to handle errors and token renewal
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const { response: { status } = {}, config } = error;
      const endpointToIgnoreAuth = endpointsToIgnoreAuth.some(endpoint =>
        config!.url?.includes(endpoint)
      );

      if (endpointToIgnoreAuth) {
        return Promise.reject(error); // Skip auth for specific endpoints
      }

      const originalRequest = config!;

      // Check if error is 401 (unauthorized)
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Mark the request to avoid loops

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const currentRefreshToken = useAuthStore.getState().refreshToken;

            if (!currentRefreshToken) {
              removeState();
              window.location.replace('/sign-in?expired');
              return;
            }

            // Request to refresh the token
            const response = await fetch(
              `${instance.getUri()}user/refresh-token`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: currentRefreshToken }), // Request body must be a JSON string
              }
            );

            if (!response.ok) {
              throw new Error(`Error refreshing token: ${response.statusText}`); // Throw error if request fails
            }

            const {
              output: { token: newToken },
            } = await response.json();

            // Update the token in the global state
            useAuthStore.setState({ token: newToken });

            // Process the pending requests queue
            processQueue(null, newToken);

            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          } catch (refreshError: any) {
            LoggerError('Error refreshing token:', refreshError);
            processQueue(refreshError, null);

            removeState();
            window.location.replace('/sign-in?expired');

            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        // Add request to queue while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch(queueError => {
            console.error('Error processing request queue:', queueError);
            return Promise.reject(queueError);
          });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createAxiosInstance('');

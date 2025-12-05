import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true, // send cookies (access + refresh tokens)
});

let isRefreshing = false;
let pendingRequests = [];

function enqueueRequest(callback) {
  pendingRequests.push(callback);
}

function resolvePendingRequests(error = null) {
  pendingRequests.forEach((callback) => callback(error));
  pendingRequests = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Network or CORS error without a response -> just reject
    if (!response) {
      return Promise.reject(error);
    }

    const status = response.status;
    const originalRequest = config;

    // Only handle 401s from non-auth endpoints, and avoid infinite loops
    if (
      status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // This uses the refreshToken cookie to issue a new accessToken cookie
        await apiClient.post('/auth/refresh');
        isRefreshing = false;
        resolvePendingRequests();
      } catch (refreshError) {
        isRefreshing = false;
        resolvePendingRequests(refreshError);

        // If refresh fails, force user back to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Queue this request until the refresh call completes
    return new Promise((resolve, reject) => {
      enqueueRequest((refreshError) => {
        if (refreshError) {
          reject(refreshError);
          return;
        }
        resolve(apiClient(originalRequest));
      });
    });
  },
);

export default apiClient;

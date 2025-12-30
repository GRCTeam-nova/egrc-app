import axios from 'axios';
import { API_URL } from 'config';

const axiosServices = axios.create({ baseURL: API_URL || 'http://localhost:8010/' });

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Endpoint para renovar o token. O usuário precisa confirmar se este é o endpoint correto.
          const response = await axiosServices.post('/api/auth/refresh-token', { refreshToken }); 
          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          localStorage.setItem('serviceToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          // Repetir a requisição original com o novo token
          return axiosServices(originalRequest);
        } catch (refreshError) {
          // Se a renovação falhar, redireciona para o login
          window.location = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    if (error.response.status === 401 && !window.location.href.includes('/login')) {
      window.location = '/login';
    }

    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });

  return res.data;
};

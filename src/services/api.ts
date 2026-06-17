import axios from 'axios';

const api = axios.create({
  baseURL: "http://10.10.85.36:8080", 
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const isCheckSession = error.config?.url?.includes("/auth/me");

    if (error.response?.status === 401 && !isCheckSession) {
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
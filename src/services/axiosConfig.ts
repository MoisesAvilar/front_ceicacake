import axios from "axios";
import { BASE_URL } from "./api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// O interceptor de resposta para o erro 401 foi movido para o AuthContext
// para que ele possa chamar a função logout e atualizar o estado global.

export default axiosInstance;
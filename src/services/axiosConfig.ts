
import axios from "axios";
import { BASE_URL } from "./api";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {

      localStorage.removeItem("token");
      history.push("/login");
      window.location.reload();
    } else {
      console.error('Erro na resposta da API:', error.response);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

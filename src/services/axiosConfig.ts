import axios, { AxiosError, AxiosResponse } from "axios";
import { BASE_URL } from "./api";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      history.push("/login");
      window.location.reload();
    } else {
      // Adicionar logs para outros erros
      console.error('Erro na resposta da API:', error.response);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

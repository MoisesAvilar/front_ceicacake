
import axios from 'axios';
import { BASE_URL } from './api';

export const fetchCustomers = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    const response = await axios.get(`${BASE_URL}/customers/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    throw error;
  }
};

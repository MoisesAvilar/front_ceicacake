import axios from "axios";

export const BASE_URL = "https://ceicacake.pythonanywhere.com/api/v1";

export interface ITokenPayload {
  access: string;
  refresh: string;
}


export async function getToken(
  username: string,
  password: string
): Promise<ITokenPayload | undefined> {
  try {
    const response = await axios.post(`${BASE_URL}/authentication/token/`, {
      username,
      password,
    });
    // A única responsabilidade desta função é retornar os dados da API.
    // O efeito colateral (salvar no localStorage) foi movido para o AuthContext.
    return response.data;
  } catch (error) {
    console.error("Erro ao obter token:", error);
    // Propaga o erro para que a lógica de UI possa tratá-lo
    throw error;
  }
}
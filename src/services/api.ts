import axios from "axios";

export const BASE_URL = "http://127.0.0.1:8000/api/v1";

export interface IUser {
  username: string;
  password: string;
  access: string;
  refresh: string;
}

export async function getToken(
  username: string,
  password: string
): Promise<IUser | undefined> {
  try {
    const response = await axios.post(`${BASE_URL}/authentication/token/`, {
      username,
      password,
    },);
    return response.data;
  } catch (error) {
    console.log("Ocorreu um erro:", error);
    return undefined;
  }
}

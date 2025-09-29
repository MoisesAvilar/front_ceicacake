import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, ITokenPayload } from '../services/api';
import axiosInstance from '../services/axiosConfig';

interface IAuthContext {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authError: string | null;
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data: ITokenPayload | undefined = await getToken(username, password);
      if (data && data.access) {
        setToken(data.access);
        localStorage.setItem('token', data.access);
        navigate('/');
      } else {
        throw new Error('Credenciais inválidas. Tente novamente.');
      }
    } catch (error: any) {
      let mensagem = "Ocorreu um erro. Tente novamente.";

      if (error.response) {
        if (error.response.status === 401) {
          mensagem = "Usuário ou senha inválidos.";
        } else if (error.response.status === 403) {
          mensagem = "Acesso negado.";
        } else if (error.response.status === 404) {
          mensagem = "Recurso não encontrado.";
        } else if (error.response.status >= 500) {
          mensagem = "Erro no servidor. Tente novamente mais tarde.";
        }
      } else if (error.request) {
        mensagem = "Não foi possível se conectar ao servidor.";
      }

      setAuthError(mensagem);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
    setAuthError(null);
    navigate('/login');
  }, [navigate]);

  // Adiciona um interceptor para tratar o logout globalmente em caso de 401
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          if (error.response.status === 401) {
            setAuthError("Sessão expirada ou não autorizada. Faça login novamente.");
            logout();
          } else if (error.response.status === 403) {
            setAuthError("Você não tem permissão para acessar este recurso.");
          } else if (error.response.status === 404) {
            setAuthError("Recurso não encontrado.");
          } else if (error.response.status >= 500) {
            setAuthError("Erro no servidor. Tente novamente mais tarde.");
          }
        } else {
          setAuthError("Erro de conexão. Verifique sua internet.");
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [logout]);


  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, isLoading, login, logout, authError }}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { useEffect, useState } from "react";
import { getToken, IUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const user: IUser | undefined = await getToken(username, password);
      if (user) {
        setIsLoggedIn(true);
        setErrorMessage("");
        setToken(user.access);
        localStorage.setItem("token", user.access);
        navigate("/");
      } else {
        setIsLoggedIn(false);
        setErrorMessage("Credenciais inválidas. Tente novamente.");
      }
    } catch (error) {
      console.error("Ocorreu um erro:", error);
      setIsLoggedIn(false);
      setErrorMessage("Ocorreu um erro. Tente novamente mais tarde.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  if (isLoggedIn) {
    navigate("/");
    return null;
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Nome de Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
      {isLoggedIn && <p>Login bem-sucedido!</p>}
    </div>
  );
};

export default Login;

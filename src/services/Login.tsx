import React, { useEffect, useState } from "react";
import { getToken, IUser } from "../services/api";
import { useNavigate } from "react-router-dom";

import styles from "../components/form/Form.module.css";
import Message from "../layout/Message";
import { MessageProps } from "../types/messageTypes";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [message, setMessage] = useState<MessageProps>({
    msg: "",
    type: "success",
  });

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const user: IUser | undefined = await getToken(username, password);
      if (user) {
        setIsLoggedIn(true);
        setToken(user.access);
        localStorage.setItem("message", "Login realizado com sucesso");
        localStorage.setItem("type", "success");
        localStorage.setItem("token", user.access);
        navigate("/");
      } else {
        setIsLoggedIn(false);
        setMessage({
          msg: "Credenciais inválidas. Tente novamente.",
          type: "error",
        });
        setTimeout(() => {
          setMessage({ msg: "", type: "success" });
        }, 3000);
      }
    } catch (error) {
      console.error("Ocorreu um erro:", error);
      setIsLoggedIn(false);
      setMessage({ msg: "Ocorreu um erro. Tente novamente.", type: "error" });
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 3000);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const storedMessage = localStorage.getItem("message");
    const storedType = localStorage.getItem("type");
    if (storedMessage && storedType) {
      setMessage({
        msg: storedMessage as string,
        type: storedType as "success" | "error" | "info",
      });
    }
    setTimeout(() => {
      localStorage.removeItem("message");
      localStorage.removeItem("type");
      setMessage({ msg: "", type: "success" });
    }, 3000);
  }, []);

  if (isLoggedIn) {
    navigate("/");
    return null;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        {message.msg && <Message msg={message.msg} type={message.type} />}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Login</legend>
          <label htmlFor="username" className={styles.label}>
            Usuário
          </label>
          <input
            type="text"
            id="username"
            value={username}
            className={styles.input}
            placeholder="Usuário"
            required
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password" className={styles.label}>
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            className={styles.input}
            placeholder="Senha"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className={styles.button}>
            Login
          </button>
        </fieldset>
        {isLoggedIn && <p>Login bem-sucedido!</p>}
      </form>
    </>
  );
};

export default Login;

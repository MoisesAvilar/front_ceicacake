import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Message from "../layout/Message";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Importe o novo arquivo de estilo específico para o Login
import styles from "./Login.module.css"; 

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username || !password) return;
    await login(username, password);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Bem-vindo de volta!</h1>
        
        {/* O componente de mensagem também precisará ser estilizado com as novas cores */}
        {authError && <Message msg={authError} type="error" />}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Usuário
            </label>
            <input
              type="text"
              id="username"
              value={username}
              className={styles.input}
              placeholder="seu.usuario"
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Senha
            </label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                className={styles.input}
                placeholder="••••••••"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                title="Mostrar senha"
                className={styles.showPasswordButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? "Entrando..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
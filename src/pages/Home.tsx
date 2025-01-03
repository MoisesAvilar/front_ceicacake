import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

import { Greeting } from "../services/getTime";
import Message from "../layout/Message";
import { MessageProps } from "../types/messageTypes";

const Home: React.FC = () => {
  const [message, setMessage] = useState<MessageProps>({
    msg: "",
    type: "success",
  });

  const greeting = Greeting();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (greeting) {
      setMessage({ msg: greeting, type: "success" });
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 5000);
    }
  }, [greeting]);

  return (
    <div className={styles.pageContainer}>
      {message.msg && <Message msg={message.msg} type={message.type} />}
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Vendas</h2>
          <Link to="/sales" className={styles.cardLink}>Visualizar vendas</Link>
          <Link to="/sales/new" className={styles.cardLink}>Registrar nova venda</Link>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Clientes</h2>
          <Link to="/customers" className={styles.cardLink}>Visualizar clientes</Link>
          <Link to="/customer/new" className={styles.cardLink}>Cadastrar novo cliente</Link>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Gráfico de Vendas</h2>
          <Link to="/sales/chart" className={styles.cardLink}>Visualizar gráficos</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

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
  });

  useEffect(() => {
    if (greeting) {
      setMessage({ msg: greeting, type: "success" });
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 5000);
    }
  }, [greeting]);

  return (
    <>
      <div className={styles.contentContainer}>
        {message.msg && <Message msg={message.msg} type={message.type} />}
        <div className={styles.saleContainer}>
          <p className={styles.title}>Vendas</p>
          <Link to="/sales">Visualizar vendas</Link>
          <Link to="/sales/new">Registrar nova venda</Link>
        </div>
        <div className={styles.customerContainer}>
          <p className={styles.title}>Clientes</p>
          <Link to="/customers">Visualizar clientes</Link>
          <Link to="/customer/new">Cadastrar novo cliente</Link>
        </div>
      </div>
    </>
  );
};

export default Home;

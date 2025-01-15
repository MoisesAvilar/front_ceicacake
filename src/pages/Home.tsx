import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

const Home: React.FC = () => {


  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Fluxo de Caixa</h2>
          <Link to="/cashflow" className={styles.cardLink}>Visualizar registros</Link>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Gráfico de Vendas</h2>
          <Link to="/sales/chart" className={styles.cardLink}>Visualizar gráficos</Link>
        </div>
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
      </div>
    </div>
  );
};

export default Home;

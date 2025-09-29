import { Link } from "react-router-dom";
import styles from "./Home.module.css";
// Importando ícones para uma UI mais rica
import { FaChartLine, FaShoppingCart, FaUsers, FaWallet } from "react-icons/fa";

const Home: React.FC = () => {
  // O hook useEffect foi removido. A proteção da rota agora
  // é de responsabilidade exclusiva do componente <PrivateRoute>.

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.mainTitle}>Painel de Controle</h1>
      <div className={styles.cardGrid}>
        {/* Card de Fluxo de Caixa */}
        <Link to="/cashflow" className={styles.card}>
          <div className={styles.cardIcon}>
            <FaWallet />
          </div>
          <h2 className={styles.cardTitle}>Fluxo de Caixa</h2>
          <p className={styles.cardDescription}>Acompanhe suas entradas e saídas.</p>
        </Link>

        {/* Card de Gráfico de Vendas */}
        <Link to="/sales/chart" className={styles.card}>
          <div className={styles.cardIcon}>
            <FaChartLine />
          </div>
          <h2 className={styles.cardTitle}>Gráfico de Vendas</h2>
          <p className={styles.cardDescription}>Visualize o desempenho do seu negócio.</p>
        </Link>

        {/* Card de Vendas */}
        <Link to="/sales" className={styles.card}>
          <div className={styles.cardIcon}>
            <FaShoppingCart />
          </div>
          <h2 className={styles.cardTitle}>Vendas</h2>
          <p className={styles.cardDescription}>Gerencie e registre novas vendas.</p>
        </Link>

        {/* Card de Clientes */}
        <Link to="/customers" className={styles.card}>
          <div className={styles.cardIcon}>
            <FaUsers />
          </div>
          <h2 className={styles.cardTitle}>Clientes</h2>
          <p className={styles.cardDescription}>Cadastre e visualize sua base de clientes.</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
import styles from "./NavBar.module.css";
import { Link, useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className={styles.nav}>
      <Link to="/">
        <img src="/MARCA1.png" alt="logo" className={styles.logo} />
      </Link>
      <h6>Administração</h6>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/">Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/sales">Vendas</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/customers">Clientes</Link>
        </li>
        {localStorage.getItem("token") && (
          <li className={styles.navItem}>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;

import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./NavBar.module.css";
import { FaSignOutAlt } from "react-icons/fa";

function NavBar() {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/">
          <img src="/MARCA1.png" alt="logo" className={styles.logo} />
        </NavLink>
        
        <ul className={styles.navList}>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/sales" 
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Vendas
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/customers" 
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Clientes
            </NavLink>
          </li>
        </ul>

        {isAuthenticated && (
          <button onClick={logout} className={styles.logoutButton} title="Sair">
            <FaSignOutAlt />
          </button>
        )}
      </nav>
    </header>
  );
}

export default NavBar;
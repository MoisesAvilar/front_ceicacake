import styles from "./NavBar.module.css";

import { Link, useNavigate } from "react-router-dom";

function NavBar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    }

  return (
    <nav className={styles.nav}>
      <h1><Link to="/">CEICACAKE</Link></h1>
      <ul className={styles.navList}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/sales">Vendas</Link></li>
        <li><Link to="/customers">Clientes</Link></li>
        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </nav>
  )
}

export default NavBar
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <ul className={styles.footerList}>
        <p>CeicaCake &copy; 2024</p>
        <p>Todos os direitos reservados</p>
        <p className={styles.developer}>Desenvolvido por: Moisés Avilar</p>
      </ul>
    </footer>
  );
};

export default Footer;

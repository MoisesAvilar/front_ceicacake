import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <span>
          CeicaCake &copy; {currentYear} - Todos os direitos reservados
        </span>
        <span className={styles.developer}>
          Desenvolvido por: Moisés Avilar
        </span>
      </div>
    </footer>
  );
};

export default Footer;
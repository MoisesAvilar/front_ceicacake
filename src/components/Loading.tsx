import React from "react";
import styles from "./Loading.module.css";

const Loading: React.FC = () => {
  // Removemos a lógica de progresso para um spinner infinito mais honesto.
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Carregando...</p>
    </div>
  );
};

export default Loading;
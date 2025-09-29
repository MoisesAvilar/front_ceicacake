import React from 'react';
import { Link } from 'react-router-dom';
import styles from './notFound.module.css'; // Importando o módulo

const NotFound: React.FC = () => {
  return (
    <div className={styles.notFoundContainer}>
      <h1 className={styles.title}>404 - Página Não Encontrada</h1>
      <p className={styles.message}>
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      <Link to="/" className={styles.homeLink}>
        Voltar para o Painel de Controle
      </Link>
    </div>
  );
};

export default NotFound;
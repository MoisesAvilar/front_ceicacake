import React from 'react';
import styles from './Pagination.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={styles.paginationContainer}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.navButton}
      >
        <FaChevronLeft />
        <span className={styles.buttonText}>Anterior</span>
      </button>
      <span className={styles.pageInfo}>
        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.navButton}
      >
        <span className={styles.buttonText}>Próxima</span>
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
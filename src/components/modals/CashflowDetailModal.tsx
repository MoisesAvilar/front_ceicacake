import React, { useEffect } from "react";
import { format, parseISO } from "date-fns";
import styles from "./CashflowDetailModal.module.css";

interface CashflowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null; 
}

const CashflowDetailModal: React.FC<CashflowDetailModalProps> = ({ isOpen, onClose, item }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isIncome = item.value_type === "PROFIT";

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Detalhes do Lançamento</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Descrição / Título</span>
            <span className={styles.value}>{item.displayTitle}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Categoria</span>
            <span className={styles.value}>{item.category}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Data</span>
            <span className={styles.value}>{format(parseISO(item.date), "dd/MM/yyyy")}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Origem</span>
            <span className={styles.value}>
              {item.isSaleOrigin ? (
                <span className={`${styles.badge} ${styles.sync}`}>Sistema de Vendas</span>
              ) : (
                <span className={`${styles.badge} ${styles.manual}`}>Lançamento Manual</span>
              )}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Tipo da Operação</span>
            <span className={styles.value}>{isIncome ? "Receita (Entrada)" : "Despesa (Saída)"}</span>
          </div>

          {/* NOVO: Renderiza a lista de itens caso existam produtos agrupados */}
          {item.products && item.products.length > 0 && (
            <div className={styles.productsSection}>
              <h4>Itens da Venda</h4>
              {item.products.map((prod: any, idx: number) => (
                <div key={idx} className={styles.productItem}>
                  <span className={styles.productName}>{prod.name}</span>
                  <span className={styles.productPrice}>
                    R$ {prod.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.infoRow} style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '2px solid var(--color-border)' }}>
            <span className={styles.label} style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Valor Total</span>
            <span className={`${styles.value} ${isIncome ? styles.income : styles.expense}`}>
              {isIncome ? "+ " : "- "}R$ {Number(item.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowDetailModal;
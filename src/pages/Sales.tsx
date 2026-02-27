import React, { useEffect, useState, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import axiosInstance from "../services/axiosConfig";
import { FaEdit, FaTrash, FaPlus, FaFilter, FaSortAmountDown, FaSortAmountUp, FaUser, FaCalendarAlt } from "react-icons/fa";

import styles from "./Sales.module.css";
import Message from "../layout/Message";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import { MessageProps } from "../types/messageTypes";
import CapitalizeText from "../components/CapitalizeText";
import CheckoutModal from "../components/form/CheckoutModal";
import ConfirmModal from "../components/modals/ConfirmModal";

interface Client {
  id: number;
  name: string;
}

const Sales: React.FC = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[] | undefined>(undefined);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<MessageProps | null>(null);
  const [selectedSales, setSelectedSales] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState<{ value: string, label: string }[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterClient, setFilterClient] = useState<string>("");
  const [filterProduct, setFilterProduct] = useState<string>("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const ITEMS_PER_PAGE = 20;

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "info";
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    action: () => {},
  });

  const displayMessage = useCallback((msg: string, type: MessageProps['type']) => {
    setMessage({ msg, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const getSales = useCallback(async () => {
    try {
      setLoading(true);
      const ordering = sortDirection === 'asc' ? 'data_hour' : '-data_hour';
      const response = await axiosInstance.get(
        `/sales/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}&ordering=${ordering}`
      );
      setSales(response.data.results);
      setTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE));
    } catch (error) {
      displayMessage("Erro ao carregar vendas.", "error");
    } finally {
      setLoading(false);
    }
  }, [displayMessage, currentPage, sortDirection]);

  useEffect(() => {
    getSales();
  }, [getSales]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [clientsRes, productsRes] = await Promise.all([
          axiosInstance.get<Client[]>('/customers/all/'),
          axiosInstance.get('/products/')
        ]);
        setAllClients(clientsRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOptions();
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => 
        (filterClient ? sale.customer_name === filterClient : true) &&
        (filterProduct ? sale.product_name === filterProduct : true) &&
        (filterPaymentStatus ? sale.payment_status === filterPaymentStatus : true)
    );
  }, [sales, filterClient, filterProduct, filterPaymentStatus]);

  const groupedSales = useMemo(() => {
    const groups = new Map<string, any[]>();
    
    filteredSales.forEach(sale => {
      const timeKey = sale.data_hour ? sale.data_hour.substring(0, 16) : "";
      const key = `${sale.customer}_${timeKey}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(sale);
    });

    return Array.from(groups.values()).map(group => {
      const first = group[0];

      if (group.length === 1) {
        return {
          ...first,
          displayTitle: first.product_name,
          groupedIds: [first.id]
        };
      } else {
        const totalValue = group.reduce((sum, item) => sum + item.total, 0);
        const allPaid = group.every(item => item.payment_status === 'PAGO');

        const additionalCount = group.length - 1;
        const itemLabel = additionalCount === 1 ? "item" : "itens";

        return {
          ...first,
          id: `group-${first.id}`,
          displayTitle: `${first.product_name} +${additionalCount} ${itemLabel}`,
          total: totalValue,
          payment_status: allPaid ? 'PAGO' : 'PENDENTE',
          groupedIds: group.map(g => g.id)
        };
      }
    });
  }, [filteredSales]);

  const uniqueProducts = useMemo(() => [...new Set(sales.map(s => s.product_name))].sort(), [sales]);
  const uniquePaymentStatus = useMemo(() => [...new Set(sales.map(s => s.payment_status))], [sales]);

  const handleToggleSelection = (ids: number[]) => {
    setSelectedSales(prev => {
      const newSet = new Set(prev);
      const allSelected = ids.every(id => newSet.has(id));
      if (allSelected) {
        ids.forEach(id => newSet.delete(id));
      } else {
        ids.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedSales.size === sales.length) {
      setSelectedSales(new Set());
    } else {
      setSelectedSales(new Set(sales.map(s => s.id)));
    }
  };

  const openDeleteConfirm = (ids: number[]) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar Exclusão",
      message: `Tem certeza que deseja excluir ${ids.length} venda(s)? Esta ação não pode ser desfeita.`,
      type: "danger",
      action: async () => {
        try {
          await Promise.all(ids.map(id => axiosInstance.delete(`/sales/${id}/`)));
          displayMessage("Excluído com sucesso!", "info");
          setSelectedSales(new Set());
          getSales();
        } catch (error) {
          displayMessage("Erro ao excluir.", "error");
        }
      }
    });
  };

  const openPaymentConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar Pagamento",
      message: `Deseja marcar ${selectedSales.size} venda(s) como PAGO?`,
      type: "info",
      action: async () => {
        try {
          await Promise.all(Array.from(selectedSales).map(id =>
            axiosInstance.patch(`/sales/${id}/`, { payment_status: "PAGO" })
          ));
          displayMessage("Status atualizado!", "info");
          setSelectedSales(new Set());
          getSales();
        } catch (error) {
          displayMessage("Erro ao atualizar.", "error");
        }
      }
    });
  };

  const handleOpenCheckout = (ids?: number[]) => {
    setSelectedIds(ids);
    setIsCheckoutOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      {message && <Message msg={message.msg} type={message.type} />}

      <header className={styles.pageHeader}>
        <h1>Vendas</h1>
        <button onClick={() => handleOpenCheckout()} className={styles.primaryButton}>
          <FaPlus /> Novo Pedido
        </button>
      </header>

      <div className={styles.actionBar}>
        <div className={styles.selectionControls}>
          <input
            type="checkbox"
            id="selectAll"
            checked={selectedSales.size > 0 && selectedSales.size === sales.length}
            onChange={handleSelectAll}
            className={styles.customCheckbox}
          />
          <label htmlFor="selectAll" className={styles.checkboxLabel}></label>
          <span className={styles.selectionCount}>
            {selectedSales.size > 0 ? `${selectedSales.size} selecionadas` : 'Selecionar'}
          </span>
        </div>
        
        {selectedSales.size > 0 ? (
          <div className={styles.bulkActions}>
            <button onClick={openPaymentConfirm} className={styles.actionButton}>Marcar Pago</button>
            <button onClick={() => openDeleteConfirm(Array.from(selectedSales))} className={`${styles.actionButton} ${styles.danger}`}>Excluir</button>
          </div>
        ) : (
          <div className={styles.filterActions}>
            <button onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')} className={styles.actionButton}>
              {sortDirection === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className={`${styles.actionButton} ${showFilters ? styles.active : ''}`}>
              <FaFilter />
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}>
            <option value="">Todos os Clientes</option>
            {allClients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
            <option value="">Todos os Produtos</option>
            {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)}>
            <option value="">Status</option>
            {uniquePaymentStatus.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {loading ? <Loading /> : (
        <>
          <div className={styles.salesGrid}>
            {groupedSales.map(saleGroup => {
              const isSelected = saleGroup.groupedIds.every((id: number) => selectedSales.has(id));

              return (
                <div key={saleGroup.id} className={styles.saleCard}>
                  <div className={styles.cardHeader}>
                    <input
                      type="checkbox"
                      id={`sale-${saleGroup.id}`}
                      checked={isSelected}
                      onChange={() => handleToggleSelection(saleGroup.groupedIds)}
                      className={styles.customCheckbox}
                    />
                    <label htmlFor={`sale-${saleGroup.id}`} className={styles.checkboxLabel}></label>
                    <label 
                      htmlFor={`sale-${saleGroup.id}`} 
                      className={`${styles.status} ${saleGroup.payment_status === 'PAGO' ? styles.statusPaid : styles.statusPending}`}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      {saleGroup.payment_status}
                    </label>
                    <span className={styles.total}>
                      <small>R$</small> {saleGroup.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.productName}>{saleGroup.displayTitle}</h3>
                    <div className={styles.infoWrapper}>
                      <p className={styles.customerName}><FaUser size={12}/> <CapitalizeText text={saleGroup.customer_name} /></p>
                      <p className={styles.saleDate}><FaCalendarAlt size={12}/> {format(parseISO(saleGroup.data_hour), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleOpenCheckout(saleGroup.groupedIds)} className={styles.iconButton}><FaEdit /></button>
                    <button onClick={() => openDeleteConfirm(saleGroup.groupedIds)} className={`${styles.iconButton} ${styles.danger}`}><FaTrash /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        clients={allClients}
        products={products}
        editIds={selectedIds}
        onSuccess={() => {
          displayMessage("Operação realizada com sucesso!", "info");
          getSales();
        }}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
};

export default Sales;
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosConfig";
import { FaEdit, FaTrash, FaPlus, FaFilter, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

import styles from "./Sales.module.css";
import Message from "../layout/Message";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import { MessageProps } from "../types/messageTypes";

const Sales: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<MessageProps | null>(null);
  const [selectedSales, setSelectedSales] = useState<Set<number>>(new Set());
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterClient, setFilterClient] = useState<string>("");
  const [filterProduct, setFilterProduct] = useState<string>("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const ITEMS_PER_PAGE = 20;

  const navigate = useNavigate();

  const displayMessage = useCallback((msg: string, type: MessageProps['type']) => {
    setMessage({ msg, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }, []);

  const getSales = useCallback(async () => {
    try {
      setLoading(true);
      const ordering = sortDirection === 'asc' ? 'data_hour' : '-data_hour';
      const response = await axiosInstance.get(
        `/sales/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}&ordering=${ordering}`
      );
      
      setSales(response.data.results);
      const totalCount = response.data.count;
      setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Ocorreu um erro ao buscar as vendas:", error);
      displayMessage("Falha ao carregar os dados. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  }, [displayMessage, currentPage, sortDirection]);

  useEffect(() => {
    getSales();
  }, [getSales]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => 
        (filterClient ? sale.customer_name === filterClient : true) &&
        (filterProduct ? sale.product_name === filterProduct : true) &&
        (filterPaymentStatus ? sale.payment_status === filterPaymentStatus : true)
    );
  }, [sales, filterClient, filterProduct, filterPaymentStatus]);

  const uniqueClients = useMemo(() => [...new Set(sales.map(s => s.customer_name))].sort((a,b) => a.localeCompare(b)), [sales]);
  const uniqueProducts = useMemo(() => [...new Set(sales.map(s => s.product_name))].sort((a,b) => a.localeCompare(b)), [sales]);
  const uniquePaymentStatus = useMemo(() => [...new Set(sales.map(s => s.payment_status))], [sales]);

  const handleToggleSelection = (id: number) => {
    setSelectedSales(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedSales.size === filteredSales.length) {
      setSelectedSales(new Set());
    } else {
      setSelectedSales(new Set(filteredSales.map(s => s.id)));
    }
  };

  const handleDelete = async (ids: number[]) => {
    const confirm = window.confirm(`Deseja realmente excluir ${ids.length} venda(s)?`);
    if (!confirm) return;

    try {
      await Promise.all(ids.map(id => axiosInstance.delete(`/sales/${id}/`)));
      displayMessage(`${ids.length} venda(s) excluída(s) com sucesso!`, "info");
      setSelectedSales(new Set());
      getSales();
    } catch (error) {
      displayMessage("Erro ao excluir a(s) venda(s).", "error");
    }
  };

  const handleUpdateStatus = async () => {
    const confirm = window.confirm(`Marcar ${selectedSales.size} venda(s) como 'PAGO'?`);
    if (!confirm) return;

    try {
      await Promise.all(
        Array.from(selectedSales).map(id =>
          axiosInstance.patch(`/sales/${id}/`, { payment_status: "PAGO" })
        )
      );
      displayMessage("Status atualizado com sucesso!", "info");
      setSelectedSales(new Set());
      getSales();
    } catch (error) {
      displayMessage("Erro ao atualizar o status.", "error");
    }
  };

  return (
    <div className={styles.pageContainer}>
      {message && <Message msg={message.msg} type={message.type} />}

      <header className={styles.pageHeader}>
        <h1>Gerenciamento de Vendas</h1>
        <Link to="/sales/new" className={styles.primaryButton}>
          <FaPlus /> Registrar Venda
        </Link>
      </header>

      <div className={styles.actionBar}>
        <div className={styles.selectionControls}>
          <input
            type="checkbox"
            id="selectAll"
            checked={selectedSales.size > 0 && selectedSales.size === filteredSales.length}
            onChange={handleSelectAll}
            className={styles.customCheckbox}
          />
          <label htmlFor="selectAll" className={styles.checkboxLabel}></label>
          <span className={styles.selectionCount}>
            {selectedSales.size > 0 ? `${selectedSales.size} selecionada(s)` : 'Selecionar'}
          </span>
        </div>
        
        {selectedSales.size > 0 ? (
          <div className={styles.bulkActions}>
            <button onClick={handleUpdateStatus} className={styles.actionButton}>Marcar como Pago</button>
            <button onClick={() => handleDelete(Array.from(selectedSales))} className={`${styles.actionButton} ${styles.danger}`}>Excluir</button>
          </div>
        ) : (
          <div className={styles.filterActions}>
            <button onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')} className={styles.actionButton}>
              {sortDirection === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              Data
            </button>
            <button onClick={() => setShowFilters(s => !s)} className={`${styles.actionButton} ${showFilters ? styles.active : ''}`}>
              <FaFilter /> Filtrar
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}>
            <option value="">Todos os Clientes</option>
            {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
            <option value="">Todos os Produtos</option>
            {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)}>
            <option value="">Todos os Status</option>
            {uniquePaymentStatus.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : filteredSales.length > 0 ? (
        <>
          <div className={styles.salesGrid}>
            {filteredSales.map(sale => (
              <div key={sale.id} className={styles.saleCard}>
                <div className={styles.cardHeader}>
                   <input
                      type="checkbox"
                      id={`sale-${sale.id}`}
                      checked={selectedSales.has(sale.id)}
                      onChange={() => handleToggleSelection(sale.id)}
                      className={styles.customCheckbox}
                    />
                    <label htmlFor={`sale-${sale.id}`} className={styles.checkboxLabel}></label>
                  <span className={`${styles.status} ${sale.payment_status === 'PAGO' ? styles.statusPaid : styles.statusPending}`}>
                    {sale.payment_status}
                  </span>
                  <span className={styles.total}>R$ {sale.total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.productName}>{sale.product_name}</p>
                  <p className={styles.customerName}>
                    Cliente: <Link to={`/customer/${sale.customer}`}>{sale.customer_name}</Link>
                  </p>
                  <p className={styles.saleDate}>
                    {format(parseISO(sale.data_hour), "dd/MM/yyyy 'às' HH:mm")}
                  </p>
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => navigate(`/sales/${sale.id}`)} className={styles.iconButton} title="Editar"><FaEdit /></button>
                  <button onClick={() => handleDelete([sale.id])} className={`${styles.iconButton} ${styles.danger}`} title="Excluir"><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className={styles.noResults}>Nenhuma venda encontrada.</p>
      )}
    </div>
  );
};

export default Sales;
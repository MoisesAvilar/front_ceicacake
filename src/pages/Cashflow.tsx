import React, { useEffect, useState, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosConfig";

import Message from "../layout/Message";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import PeriodSelector from "../components/PeriodSelector"; // 1. Importar o PeriodSelector
import { MessageProps } from "../types/messageTypes";
import { CashflowTypes } from "../types/cashflowTypes";

import styles from "./Cashflow.module.css";
import { FaEdit, FaPlus, FaArrowUp, FaArrowDown } from "react-icons/fa";

const Cashflow: React.FC = () => {
  const [cashflowData, setCashflowData] = useState<CashflowTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<MessageProps | null>(null);

  const [filterType, setFilterType] = useState<"all" | "PROFIT" | "EXPENSE">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const ITEMS_PER_PAGE = 15;

  // 2. Adicionar state para o período
  const [period, setPeriod] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  const navigate = useNavigate();

  const displayMessage = useCallback((msg: string, type: MessageProps['type']) => {
    setMessage({ msg, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  // 3. Modificar getCashflowData para enviar o período
  const getCashflowData = useCallback(async () => {
    // Só busca os dados se o período estiver definido
    if (!period.startDate || !period.endDate) return;

    try {
      setLoading(true);
      // Adiciona os parâmetros de data na requisição
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: ITEMS_PER_PAGE.toString(),
        start_date: period.startDate,
        end_date: period.endDate,
      });

      const response = await axiosInstance.get(`/cashflow/?${params.toString()}`);

      setCashflowData(response.data.results);
      const totalCount = response.data.count;
      setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Falha ao buscar os dados de fluxo de caixa.", error);
      displayMessage("Erro ao carregar os dados. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  }, [displayMessage, currentPage, period]); // 4. Adicionar 'period' como dependência

  useEffect(() => {
    getCashflowData();
  }, [getCashflowData]);

  const filteredData = useMemo(() => {
    // 5. A ordenação por data foi REMOVIDA daqui, pois o backend já faz isso
    return cashflowData
      .filter(item => 
        (filterType === 'all' || item.value_type === filterType) &&
        (filterCategory === 'all' || item.category === filterCategory)
      );
  }, [cashflowData, filterType, filterCategory]);

  const summary = useMemo(() => {
    // Importante: O resumo agora é calculado com base nos dados filtrados da página atual
    return filteredData.reduce((acc, item) => {
      const value = Number(item.value);
      if (item.value_type === 'PROFIT') acc.totalProfit += value;
      else acc.totalExpense += value;
      acc.balance = acc.totalProfit - acc.totalExpense;
      return acc;
    }, { totalProfit: 0, totalExpense: 0, balance: 0 });
  }, [filteredData]);
  
  const uniqueCategories = useMemo(() => [...new Set(cashflowData.map(item => item.category))].sort((a,b)=>a.localeCompare(b)), [cashflowData]);

  // 6. Handler para atualizar o período
  const handlePeriodChange = (startDate: string, endDate: string) => {
    setPeriod({ startDate, endDate });
    setCurrentPage(1); // Reseta para a primeira página ao mudar o período
  };

  return (
    <div className={styles.pageContainer}>
      {message && <Message msg={message.msg} type={message.type} />}

      <header className={styles.pageHeader}>
        <h1>Fluxo de Caixa</h1>
        <Link to="/cashflow/new" className={styles.primaryButton}>
          <FaPlus /> Novo Registro
        </Link>
      </header>

      {/* 7. Adicionar o PeriodSelector */}
      <div className={styles.periodSelectorContainer}>
        <PeriodSelector onChange={handlePeriodChange} />
      </div>
      
      {/* RESUMO FINANCEIRO */}
      <div className={styles.summaryContainer}>
        <div className={`${styles.summaryCard} ${styles.profit}`}>
          <div className={styles.cardHeader}>
            <FaArrowUp /> <span>Total de Receitas</span>
          </div>
          <p className={styles.cardValue}>R$ {summary.totalProfit.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className={`${styles.summaryCard} ${styles.expense}`}>
          <div className={styles.cardHeader}>
            <FaArrowDown /> <span>Total de Despesas</span>
          </div>
          <p className={styles.cardValue}>R$ {summary.totalExpense.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <span>Saldo Final</span>
          </div>
          <p className={styles.cardValue}>R$ {summary.balance.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      {/* PAINEL DE FILTROS */}
      <div className={styles.filtersPanel}>
        <select value={filterType} onChange={e => setFilterType(e.target.value as any)}>
          <option value="all">Todos os Tipos</option>
          <option value="PROFIT">Receita</option>
          <option value="EXPENSE">Despesa</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">Todas as Categorias</option>
          {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : filteredData.length > 0 ? (
        <div className={styles.cashflowGrid}>
          {filteredData.map(item => (
            <div key={item.id} className={`${styles.cashflowCard} ${item.value_type === 'PROFIT' ? styles.income : styles.expense}`}>
              <div className={styles.cardContent}>
                <span className={styles.category}>{item.category}</span>
                <p className={styles.description}>{item.description || 'Sem descrição'}</p>
                <span className={styles.date}>{format(parseISO(item.date), "dd/MM/yyyy")}</span>
              </div>
              <div className={styles.cardValueSection}>
                <span className={styles.value}>
                  {item.value_type === 'EXPENSE' ? '-' : '+'} R$ {Number(item.value).toFixed(2).replace('.', ',')}
                </span>
                <button onClick={() => navigate(`/cashflow/${item.id}`)} className={styles.iconButton} title="Editar">
                  <FaEdit />
                </button>
              </div>
            </div>
          ))}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        </div>
      ) : (
        <p className={styles.noResults}>Nenhum registro encontrado para os filtros selecionados.</p>
      )}
    </div>
  );
};

export default Cashflow;
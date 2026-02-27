import React, { useEffect, useState, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import axiosInstance from "../services/axiosConfig";

import Message from "../layout/Message";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import PeriodSelector from "../components/PeriodSelector";
import { MessageProps } from "../types/messageTypes";
import { CashflowTypes } from "../types/cashflowTypes";
import UniversalModal from "../components/form/UniversalModal";
import CashflowDetailModal from "../components/modals/CashflowDetailModal";

import styles from "./Cashflow.module.css";
import { FaEdit, FaPlus, FaArrowUp, FaArrowDown, FaWallet, FaFilter } from "react-icons/fa";

const Cashflow: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [detailItem, setDetailItem] = useState<any | null>(null);

  const [cashflowData, setCashflowData] = useState<CashflowTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<MessageProps | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "PROFIT" | "EXPENSE">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const ITEMS_PER_PAGE = 15;

  const [period, setPeriod] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  const displayMessage = useCallback((msg: string, type: MessageProps['type']) => {
    setMessage({ msg, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const getCashflowData = useCallback(async () => {
    if (!period.startDate || !period.endDate) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: ITEMS_PER_PAGE.toString(),
        start_date: period.startDate,
        end_date: period.endDate,
        ordering: '-date'
      });

      const response = await axiosInstance.get(`/cashflow/?${params.toString()}`);
      
      if (response.data && response.data.results) {
        setCashflowData(response.data.results);
        setTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      displayMessage("Erro ao carregar dados financeiros.", "error");
    } finally {
      setLoading(false);
    }
  }, [displayMessage, currentPage, period]);

  useEffect(() => {
    getCashflowData();
  }, [getCashflowData]);

  const filteredData = useMemo(() => {
    return cashflowData.filter(item => {
      const matchType = filterType === 'all' || item.value_type === filterType;
      const matchCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchType && matchCategory;
    });
  }, [cashflowData, filterType, filterCategory]);

  const summary = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      const value = Number(item.value);
      if (item.value_type === 'PROFIT') acc.totalProfit += value;
      else acc.totalExpense += value;
      acc.balance = acc.totalProfit - acc.totalExpense;
      return acc;
    }, { totalProfit: 0, totalExpense: 0, balance: 0 });
  }, [filteredData]);

  const uniqueCategories = useMemo(() => [...new Set(cashflowData.map(item => item.category))].sort(), [cashflowData]);

  const groupedCashflow = useMemo(() => {
    const groups = new Map<string, any[]>();
    
    filteredData.forEach(item => {
      if (item.description && item.description.includes("ID-REF-")) {
        const customerMatch = item.description.match(/Cliente:\s+(.*?)\s+\(ID-REF-/);
        const customerName = customerMatch ? customerMatch[1] : "Desconhecido";
        
        const key = `sale_${item.date}_${customerName}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(item);
      }
    });

    const result: any[] = [];
    const processedGroups = new Set<string>();

    filteredData.forEach(item => {
      const isSaleOrigin = item.description && item.description.includes("ID-REF-");

      if (!isSaleOrigin) {
        result.push({
          ...item,
          isGrouped: false,
          isSaleOrigin: false,
          displayTitle: item.description || 'Sem descrição',
          products: [] // Manuais não possuem produtos associados
        });
      } else {
        const customerMatch = item.description!.match(/Cliente:\s+(.*?)\s+\(ID-REF-/);
        const customerName = customerMatch ? customerMatch[1] : "Desconhecido";
        const key = `sale_${item.date}_${customerName}`;

        if (!processedGroups.has(key)) {
          processedGroups.add(key);
          const groupItems = groups.get(key)!;
          const first = groupItems[0];
          
          // Função auxiliar para extrair o nome do produto da descrição
          const extractProduct = (desc: string) => {
            const match = desc.match(/Venda:\s+(.*?)\s+-\s+Cliente:/);
            return match ? match[1] : "Produto";
          };

          if (groupItems.length === 1) {
            const productName = extractProduct(first.description!);
            result.push({
              ...first,
              isGrouped: false,
              isSaleOrigin: true,
              displayTitle: `Venda: ${productName} - Cliente: ${customerName}`,
              products: [{ name: productName, value: Number(first.value) }]
            });
          } else {
            const productsList = groupItems.map(gi => ({
              name: extractProduct(gi.description!),
              value: Number(gi.value)
            }));
            const totalValue = groupItems.reduce((sum, i) => sum + Number(i.value), 0);
            
            result.push({
              ...first,
              id: `group-${first.id}`,
              value: totalValue,
              isGrouped: true,
              isSaleOrigin: true,
              displayTitle: `Venda em conjunto (${groupItems.length} itens) - Cliente: ${customerName}`,
              products: productsList
            });
          }
        }
      }
    });

    return result;
  }, [filteredData]);

  const handlePeriodChange = useCallback((startDate: string, endDate: string) => {
    setCashflowData([]);
    setPeriod({ startDate, endDate }); 
    setCurrentPage(1); 
  }, []);

  return (
    <div className={styles.pageContainer}>
      {message && <Message msg={message.msg} type={message.type} />}

      <header className={styles.pageHeader}>
        <h1>Caixa</h1>
        <button onClick={() => { setSelectedId(undefined); setIsModalOpen(true); }} className={styles.primaryButton}>
          <FaPlus /> Novo Lançamento
        </button>
      </header>

      <div className={styles.periodSection}>
        <PeriodSelector onChange={handlePeriodChange} />
      </div>

      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.profit}`}>
          <div className={styles.cardInfo}>
            <span className={styles.label}>Receitas</span>
            <p className={styles.value}>R$ {summary.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={styles.iconCircle}><FaArrowUp /></div>
        </div>

        <div className={`${styles.summaryCard} ${styles.expense}`}>
          <div className={styles.cardInfo}>
            <span className={styles.label}>Despesas</span>
            <p className={styles.value}>R$ {summary.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={styles.iconCircle}><FaArrowDown /></div>
        </div>

        <div className={`${styles.summaryCard} ${styles.balance}`}>
          <div className={styles.cardInfo}>
            <span className={styles.label}>Saldo do Período</span>
            <p className={styles.value}>R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={styles.iconCircle}><FaWallet /></div>
        </div>
      </div>

      <div className={styles.toolBar}>
        <button onClick={() => setShowFilters(!showFilters)} className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}>
          <FaFilter /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <select value={filterType} onChange={e => setFilterType(e.target.value as any)}>
            <option value="all">Tipo: Todos</option>
            <option value="PROFIT">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">Categoria: Todas</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      )}

      {loading ? <Loading /> : (
        <div className={styles.cashflowList}>
          {groupedCashflow.length > 0 ? (
            <>
              {groupedCashflow.map(item => (
                <div 
                  key={item.id} 
                  className={`${styles.cashflowCard} ${item.value_type === 'PROFIT' ? styles.income : styles.expense}`}
                  onClick={() => setDetailItem(item)}
                >
                  <div className={styles.cardMain}>
                    <div className={styles.info}>
                      <div className={styles.tagWrapper}>
                        <span className={styles.categoryTag}>{item.category}</span>
                        {item.isSaleOrigin && (
                          <span className={styles.originBadge} title="Sincronizado com uma venda.">Sincronizado</span>
                        )}
                      </div>
                      <h3 className={styles.itemDescription}>{item.displayTitle}</h3>
                      <span className={styles.itemDate}>{format(parseISO(item.date), "dd MMM, yyyy")}</span>
                    </div>

                    <div className={styles.amountArea}>
                      <span className={styles.amountValue}>
                        {item.value_type === 'EXPENSE' ? '- ' : '+ '}
                        R$ {Number(item.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.isSaleOrigin && item.id && !item.isGrouped) {
                            setSelectedId(item.id.toString());
                            setIsModalOpen(true);
                          }
                        }}
                        className={`${styles.editBtn} ${item.isSaleOrigin ? styles.disabledBtn : ''}`}
                        title={item.isSaleOrigin ? "Vendas devem ser editadas na tela de Vendas" : "Editar"}
                        disabled={item.isSaleOrigin}
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          ) : (
            <div className={styles.emptyState}>Nenhum lançamento neste período.</div>
          )}
        </div>
      )}

      <UniversalModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); getCashflowData(); }}
        title="Lançamento"
        endpoint="/cashflow"
        id={selectedId}
        initialData={{ category: "", value: "", value_type: "", date: format(new Date(), "yyyy-MM-dd"), description: "" }}
        fields={[
          { label: "Categoria*", name: "category", type: "text", required: true, placeholder: "Ex: Aluguel, Venda..." },
          { label: "Valor (R$)*", name: "value", type: "number", step: "0.01", required: true },
          { label: "Data*", name: "date", type: "date", required: true },
          { label: "Tipo*", name: "value_type", type: "select", required: true, options: [{ value: "PROFIT", label: "Receita (Entrada)" }, { value: "EXPENSE", label: "Despesa (Saída)" }] },
          { label: "Descrição", name: "description", type: "text", placeholder: "Opcional" },
        ]}
      />

      <CashflowDetailModal 
        isOpen={!!detailItem} 
        onClose={() => setDetailItem(null)} 
        item={detailItem} 
      />
    </div>
  );
};

export default Cashflow;
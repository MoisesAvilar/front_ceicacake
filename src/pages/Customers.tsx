import React, { useEffect, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axiosConfig";

import Message from "../layout/Message";
import Loading from "../components/Loading";
import { MessageProps } from "../types/messageTypes";
import Pagination from "../components/Pagination";
import CapitalizeText from "../components/CapitalizeText";
import ConfirmModal from "../components/modals/ConfirmModal";

import styles from "./Customers.module.css";
import { FaEdit, FaTrash, FaPlus, FaPhone, FaBirthdayCake, FaCreditCard, FaShoppingBag } from "react-icons/fa";
import UniversalModal from "../components/form/UniversalModal";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const Customers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<MessageProps | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  // NOVO: Estado para controlar o filtro de status
  const [filterActive, setFilterActive] = useState<string>("true");

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

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const displayMessage = useCallback((msg: string, type: MessageProps['type']) => {
    setMessage({ msg, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const getAllCustomers = useCallback(async () => {
    try {
      setLoading(true);
      // Incluímos o status de is_active na URL da API
      let url = `/customers/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}&search=${debouncedSearchQuery}`;
      
      if (filterActive !== "") {
        url += `&is_active=${filterActive}`;
      }

      const response = await axiosInstance.get(url);
      
      setCustomers(response.data.results); 
      const totalCount = response.data.count;
      setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));

    } catch (error) {
      displayMessage("Falha ao carregar os clientes.", "error");
    } finally {
      setLoading(false);
    }
  }, [displayMessage, currentPage, debouncedSearchQuery, filterActive]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery, filterActive]);

  useEffect(() => {
    getAllCustomers();
  }, [getAllCustomers]);
  
  const openDeleteConfirm = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar Exclusão",
      message: `Deseja realmente excluir o cliente "${name}"?`,
      type: "danger",
      action: async () => {
        try {
          await axiosInstance.delete(`/customers/${id}/`);
          displayMessage("Cliente excluído com sucesso.", "info");
          getAllCustomers();
        } catch (error: any) {
          const errorMsg = error.response?.data?.error || "Erro ao excluir o cliente.";
          displayMessage(errorMsg, "error");
        }
      }
    });
  };

  const formatPhoneNumber = (phone: string) => `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  const formatDate = (date: string) => format(parseISO(date), "dd/MM/yyyy");

  return (
    <div className={styles.pageContainer}>
      {message && <Message msg={message.msg} type={message.type} />}

      <header className={styles.pageHeader}>
        <h1>Gerenciar Clientes</h1>
        <button 
          onClick={() => { setSelectedId(undefined); setIsModalOpen(true); }} 
          className={styles.primaryButton}
        >
          <FaPlus /> Cadastrar Cliente
        </button>
      </header>
            
      {/* NOVO: Ajuste visual para o Search e o Dropdown ficarem lado a lado */}
      <div className={styles.searchBar} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar cliente por nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select 
          className={styles.searchInput} 
          style={{ width: 'auto' }}
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : customers.length > 0 ? (
        <> 
          <div className={styles.customerGrid}>
            {customers.map((customer) => (
              <div key={customer.id} className={styles.customerCard}>
                <div className={styles.cardHeader}>
                  <Link to={`/customer/${customer.id}`} className={styles.customerName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CapitalizeText text={customer.name} />
                    {/* Badge visual para clientes inativos */}
                    {!customer.is_active && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-error)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        Inativo
                      </span>
                    )}
                  </Link>
                  <div className={styles.cardActions}>
                    <button 
                      onClick={() => { setSelectedId(customer.id); setIsModalOpen(true); }} 
                      className={styles.iconButton} 
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => openDeleteConfirm(customer.id, customer.name)} 
                      className={`${styles.iconButton} ${styles.danger}`} 
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  {customer.phone_number ? (
                    <div className={styles.infoRow}><FaPhone /><p>{formatPhoneNumber(customer.phone_number)}</p></div>
                  ) : (
                    <div className={styles.infoRow}><FaPhone /><p className={styles.noInfoText}>Não informado</p></div>
                  )}

                  {customer.birthday ? (
                    <div className={styles.infoRow}><FaBirthdayCake /><p>{formatDate(customer.birthday)}</p></div>
                  ) : (
                    <div className={styles.infoRow}><FaBirthdayCake /><p className={styles.noInfoText}>Não informada</p></div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.financialInfo} title="Total em Compras">
                    <FaShoppingBag className={styles.successIcon} />
                    <span>R$ {customer.bought.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className={styles.financialInfo} title="Dívida Atual">
                    <FaCreditCard className={styles.dangerIcon} />
                    <span>R$ {customer.debt.toFixed(2).replace(".", ",")}</span>
                  </div>
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
        <p className={styles.noResults}>Nenhum cliente encontrado.</p>
      )}

      {/* NOVO: Campo Status adicionado ao Modal Universal */}
      <UniversalModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); getAllCustomers(); }}
        title="Cliente"
        endpoint="/customers"
        id={selectedId}
        initialData={{ name: "", phone_number: null, birthday: null, is_active: true, debt: 0, bought: 0 }}
        fields={[
          { label: "Nome*", name: "name", type: "text", required: true },
          { label: "Telefone", name: "phone_number", type: "tel", placeholder: "(99) 99999-9999" },
          { label: "Data de Nascimento", name: "birthday", type: "date" },
          { label: "Status*", name: "is_active", type: "select", required: true, options: [{ label: "Ativo", value: "true" }, { label: "Inativo", value: "false" }] },
          { label: "Dívida", name: "debt", type: "number", step: "0.01" },
          { label: "Valor em compras", name: "bought", type: "number", step: "0.01" },
        ]}
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

export default Customers;
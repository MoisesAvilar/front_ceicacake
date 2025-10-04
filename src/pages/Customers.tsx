import React, { useEffect, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axiosConfig";

import Message from "../layout/Message";
import Loading from "../components/Loading";
import { MessageProps } from "../types/messageTypes";
import Pagination from "../components/Pagination";
import CapitalizeText from "../components/CapitalizeText";

import styles from "./Customers.module.css";
import { FaEdit, FaTrash, FaPlus, FaPhone, FaBirthdayCake, FaCreditCard, FaShoppingBag } from "react-icons/fa";

// Hook customizado para o "debounce"
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
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<MessageProps | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const ITEMS_PER_PAGE = 20;

  // Usa o hook de debounce para evitar chamadas excessivas à API
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const displayMessage = useCallback((msg: string, type: MessageProps['type']) => {
    setMessage({ msg, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const getAllCustomers = useCallback(async () => {
    try {
      setLoading(true);
      // Adiciona o parâmetro `search` à chamada da API
      const response = await axiosInstance.get(`/customers/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}&search=${debouncedSearchQuery}`);
      
      setCustomers(response.data.results); 
      const totalCount = response.data.count;
      setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));

    } catch (error) {
      console.error("Ocorreu um erro ao buscar clientes:", error);
      displayMessage("Falha ao carregar os clientes.", "error");
    } finally {
      setLoading(false);
    }
  }, [displayMessage, currentPage, debouncedSearchQuery]); // Adiciona a busca debounced como dependência

  // Reseta a página para 1 quando uma nova busca é feita
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery]);


  useEffect(() => {
    getAllCustomers();
  }, [getAllCustomers]);
  
  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este cliente?")) return;

    try {
      await axiosInstance.delete(`/customers/${id}/`);
      displayMessage("Cliente excluído com sucesso.", "info");
      getAllCustomers();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      displayMessage("Erro ao excluir o cliente.", "error");
    }
  };

  // REMOVEMOS A FILTRAGEM LOCAL (filteredCustomers)
  // O backend agora faz todo o trabalho!

  const formatPhoneNumber = (phone: string) => `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  const formatDate = (date: string) => format(parseISO(date), "dd/MM/yyyy");

  return (
    <div className={styles.pageContainer}>
      {message && <Message msg={message.msg} type={message.type} />}

      <header className={styles.pageHeader}>
        <h1>Gerenciar Clientes</h1>
        <Link to="/customer/new" className={styles.primaryButton}>
          <FaPlus /> Cadastrar Cliente
        </Link>
      </header>
      
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar cliente por nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <Loading />
        // Agora usamos `customers` diretamente, pois a API já retorna a lista filtrada
      ) : customers.length > 0 ? (
        <> 
          <div className={styles.customerGrid}>
            {customers.map((customer) => (
              <div key={customer.id} className={styles.customerCard}>
                {/* O restante do seu JSX permanece igual */}
                <div className={styles.cardHeader}>
                  <Link to={`/customer/${customer.id}`} className={styles.customerName}>
                    <CapitalizeText text={customer.name} />
                  </Link>
                  <div className={styles.cardActions}>
                    <Link to={`/customer/${customer.id}?edit=true`} className={styles.iconButton} title="Editar">
                      <FaEdit />
                    </Link>
                    <button onClick={() => handleDeleteCustomer(customer.id)} className={`${styles.iconButton} ${styles.danger}`} title="Excluir">
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
    </div>
  );
};

export default Customers;
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../services/axiosConfig';
import { format, parseISO } from 'date-fns';

import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import Message from '../layout/Message';
import { MessageProps } from '../types/messageTypes';
import UniversalModal from '../components/form/UniversalModal';

import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import styles from './CustomerDetail.module.css';

const CustomerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();

    // Novo State para controlar o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // States para os dados
    const [customer, setCustomer] = useState<any>(null);
    const [salesHistory, setSalesHistory] = useState<any[]>([]);
    const [message, setMessage] = useState<MessageProps | null>(null);

    // States de loading e paginação
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const ITEMS_PER_PAGE = 12;

    const displayMessage = (msg: string, type: MessageProps['type']) => {
        setMessage({ msg, type });
        setTimeout(() => setMessage(null), 3000);
    };

    // Abre o modal automaticamente se vier da URL com ?edit=true
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('edit') === 'true') {
            setIsModalOpen(true);
        }
    }, [location.search]);

    // Busca todos os dados (cliente + histórico)
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const customerPromise = axiosInstance.get(`/customers/${id}/`);
            const historyPromise = axiosInstance.get(`/customers/${id}/sales/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`);
            
            const [customerResponse, historyResponse] = await Promise.all([customerPromise, historyPromise]);
            
            setCustomer(customerResponse.data);
            
            setSalesHistory(historyResponse.data.results);
            const totalCount = historyResponse.data.count;
            setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));

        } catch (error) {
            console.error("Erro ao buscar dados", error);
            displayMessage("Erro ao carregar dados do cliente.", "error");
        } finally {
            setLoading(false);
        }
    }, [id, currentPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className={styles.pageContainer}>
            {message && <Message msg={message.msg} type={message.type} />}
            
            <header className={styles.pageHeader}>
                <Link to="/customers" className={styles.backLink}>
                    <FaArrowLeft /> Voltar
                </Link>
                <button onClick={() => setIsModalOpen(true)} className={styles.editButton}>
                    <FaEdit /> Editar
                </button>
            </header>
            
            <div className={styles.customerDetailsSection}>
                <div className={styles.detailsView}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {customer?.name}
                        {/* Badge visual para cliente inativo na página de detalhes */}
                        {customer && !customer.is_active && (
                            <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--color-error)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 'bold' }}>
                                Inativo
                            </span>
                        )}
                    </h1>
                    <p><strong>Telefone:</strong> {customer?.phone_number || 'Não informado'}</p>
                    <p><strong>Aniversário:</strong> {customer?.birthday ? format(parseISO(customer.birthday), "dd/MM/yyyy") : 'Não informado'}</p>
                    <p><strong>Total em Compras:</strong> R$ {customer?.bought.toFixed(2).replace('.', ',')}</p>
                    <p><strong>Dívida Atual:</strong> R$ {customer?.debt.toFixed(2).replace('.', ',')}</p>
                </div>
            </div>

            <div className={styles.historySection} style={{ marginTop: '1.5rem' }}>
                <h2>Histórico de Compras</h2>
                {salesHistory.length > 0 ? (
                    <>
                        <div className={styles.historyGrid}>
                            {salesHistory.map(sale => (
                                <div key={sale.id} className={styles.saleCard}>
                                    <p><strong>Produto:</strong> {sale.product_name}</p>
                                    <p><strong>Data:</strong> {format(parseISO(sale.data_hour), "dd/MM/yyyy")}</p>
                                    <p><strong>Valor:</strong> R$ {sale.total.toFixed(2).replace('.', ',')}</p>
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
                    <p className={styles.noHistory}>Este cliente ainda não realizou nenhuma compra.</p>
                )}
            </div>

            {/* Substituição do formulário inline pelo UniversalModal */}
            {customer && (
                <UniversalModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); fetchData(); }}
                    title="Cliente"
                    endpoint="/customers"
                    id={id}
                    initialData={{ 
                        name: customer.name, 
                        phone_number: customer.phone_number, 
                        birthday: customer.birthday, 
                        is_active: customer.is_active ? "true" : "false", // Padronizado para o select
                        debt: customer.debt, 
                        bought: customer.bought 
                    }}
                    fields={[
                        { label: "Nome*", name: "name", type: "text", required: true },
                        { label: "Telefone", name: "phone_number", type: "tel", placeholder: "(99) 99999-9999" },
                        { label: "Data de Nascimento", name: "birthday", type: "date" },
                        { label: "Status*", name: "is_active", type: "select", required: true, options: [{ label: "Ativo", value: "true" }, { label: "Inativo", value: "false" }] },
                        { label: "Dívida", name: "debt", type: "number", step: "0.01" },
                        { label: "Valor em compras", name: "bought", type: "number", step: "0.01" },
                    ]}
                />
            )}
        </div>
    );
};

export default CustomerDetail;
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation  } from 'react-router-dom';
import axiosInstance from '../services/axiosConfig';
import { format, parseISO } from 'date-fns';

import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import Message from '../layout/Message';
import { MessageProps } from '../types/messageTypes';

import { FaArrowLeft, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import styles from './CustomerDetail.module.css';

const CustomerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const location = useLocation();

    // State para o modo de edição
    const [isEditing, setIsEditing] = useState(false);
    
    // States para os dados
    const [customer, setCustomer] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', phone_number: '', birthday: '' });
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

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('edit') === 'true') {
            setIsEditing(true);
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
            setFormData({
                name: customerResponse.data.name,
                phone_number: customerResponse.data.phone_number,
                birthday: customerResponse.data.birthday
            });
            
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

    // Handlers do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/customers/${id}/`, formData);
            displayMessage("Cliente atualizado com sucesso!", "success");
            setIsEditing(false);
            fetchData(); // Recarrega os dados para mostrar a atualização
        } catch (error) {
            console.error("Erro ao atualizar cliente", error);
            displayMessage("Erro ao salvar alterações.", "error");
        }
    };

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
            {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                        <FaEdit /> Editar
                    </button>
                )}
            </header>
            
            <form onSubmit={handleSubmit}>
                <div className={styles.customerDetailsSection}>
                    {isEditing ? (
                        <>
                            <div className={styles.inputGroup}>
                                <label htmlFor="name">Nome</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="phone_number">Telefone</label>
                                <input type="text" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
                            </div>
                             <div className={styles.inputGroup}>
                                <label htmlFor="birthday">Data de Nascimento</label>
                                <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} />
                            </div>
                            <div className={styles.formActions}>
                                <button type="submit" className={styles.saveButton}><FaSave /> Salvar</button>
                                <button type="button" onClick={() => setIsEditing(false)} className={styles.cancelButton}><FaTimes /> Cancelar</button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.detailsView}>
                            <h1>{customer?.name}</h1>
                            <p><strong>Telefone:</strong> {customer?.phone_number || 'Não informado'}</p>
                            <p><strong>Aniversário:</strong> {customer?.birthday ? format(parseISO(customer.birthday), "dd/MM/yyyy") : 'Não informado'}</p>
                        </div>
                    )}
                </div>
            </form>

            <div className={styles.historySection}>
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
        </div>
    );
};

export default CustomerDetail;
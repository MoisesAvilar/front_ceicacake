import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosConfig";
import { SalesTypes } from "../../types/salesTypes";
import { PaymentStatus } from "../../services/payment_status";
import { Product } from "../../services/productTypes";
import CapitalizeText from "../../components/CapitalizeText";
import styles from "./Form.module.css";
import { FaUserPlus } from "react-icons/fa";

// Interface simples para os dados do cliente que precisamos no dropdown
interface Customer {
  id: number;
  name: string;
}

const SalesForm: React.FC = () => {
  const [sales, setSales] = useState<SalesTypes>({
    product: "",
    price: 0,
    quantity: 1, // Valor inicial padrão
    customer: "",
    payment_status: "PENDENTE", // Valor inicial padrão
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(true); // Loading para os selects

  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  // Busca produtos e clientes em paralelo para otimizar
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const productsPromise = axiosInstance.get<Product[]>('/products/');
        const customersPromise = axiosInstance.get<Customer[]>('/customers/all/');
        const [productsResponse, customersResponse] = await Promise.all([productsPromise, customersPromise]);
        setProducts(productsResponse.data);
        setCustomers(customersResponse.data);
      } catch (error) {
        console.error("Erro ao carregar opções do formulário:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    
    fetchOptions();
  }, []);

  // Busca a venda específica se estiver no modo de edição
  useEffect(() => {
    if (isEditing) {
      axiosInstance.get<SalesTypes>(`/sales/${id}/`)
        .then(response => setSales(response.data))
        .catch(error => console.error("Erro ao buscar a venda:", error));
    }
  }, [id, isEditing]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setSales((prevSales) => ({
      ...prevSales,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const promise = isEditing
        ? axiosInstance.put(`/sales/${id}/`, sales)
        : axiosInstance.post(`/sales/`, sales);
      
      await promise;

      localStorage.setItem("message", `Venda ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso`);
      localStorage.setItem("type", "success");
      navigate("/sales");

    } catch (error) {
      console.error(`Ocorreu um erro ao ${isEditing ? "atualizar" : "cadastrar"} a venda:`, error);
      localStorage.setItem("message", `Ocorreu um erro ao salvar a venda.`);
      localStorage.setItem("type", "error");
      navigate("/sales");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            {isEditing ? "Editar Venda" : "Registrar Venda"}
          </legend>

          <div className={styles.inputGroup}>
            <label htmlFor="product" className={styles.label}>Produto*</label>
            <select name="product" id="product" value={sales.product} onChange={handleChange} required className={styles.select} disabled={isLoadingOptions}>
              {isLoadingOptions ? (
                <option>Carregando produtos...</option>
              ) : (
                <>
                  <option value="" disabled>Selecione um produto</option>
                  {products.map((p) => ( <option key={p.value} value={p.value}>{p.label}</option> ))}
                </>
              )}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="price" className={styles.label}>Preço (R$)*</label>
            <input type="number" id="price" name="price" placeholder="Ex: 25.50" value={sales.price} onChange={handleChange} required className={styles.input} step="0.01" />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="quantity" className={styles.label}>Quantidade*</label>
            <input type="number" id="quantity" name="quantity" placeholder="Informe a quantidade" value={sales.quantity} onChange={handleChange} required className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="customer" className={styles.labelWithAction}>
              <span>Cliente*</span>
              <Link to="/customer/new" className={styles.addCustomerLink}>
                <FaUserPlus /> Novo Cliente
              </Link>
            </label>
            <select name="customer" id="customer" value={sales.customer} onChange={handleChange} required className={styles.select} disabled={isLoadingOptions}>
              {isLoadingOptions ? (
                <option>Carregando clientes...</option>
              ) : (
                <>
                  <option value="" disabled>Selecione um cliente</option>
                  {customers.map((c) => ( <option key={c.id} value={c.id}>
                    <CapitalizeText text={c.name} />
                  </option> ))}
                </>
              )}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="payment_status" className={styles.label}>Status de Pagamento*</label>
            <select name="payment_status" id="payment_status" value={sales.payment_status} onChange={handleChange} required className={styles.select}>
              <option value="" disabled>Selecione o status</option>
              {PaymentStatus.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles.button} disabled={isLoading || isLoadingOptions}>
            {isLoading ? "Salvando..." : (isEditing ? "Atualizar" : "Registrar")}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default SalesForm;
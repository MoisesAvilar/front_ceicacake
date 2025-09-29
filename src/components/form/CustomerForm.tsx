import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosConfig";
import { CustomerTypes } from "../../types/customerTypes";
import styles from './Form.module.css';

const CustomerForm: React.FC = () => {
  const [customer, setCustomer] = useState<CustomerTypes>({
    name: "",
    phone_number: null,
    birthday: null,
    debt: 0.0,
    bought: 0.0,
  });

  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      axiosInstance.get<CustomerTypes>(`/customers/${id}/`)
        .then(response => setCustomer(response.data))
        .catch(error => console.error("Houve um erro ao buscar o cliente:", error));
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value === "" ? null : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const promise = isEditing
        ? axiosInstance.put(`/customers/${id}/`, customer)
        : axiosInstance.post(`/customers/`, customer);
      
      await promise;
      
      localStorage.setItem("message", `Cliente ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso`);
      localStorage.setItem("type", "success");
      navigate("/customers");
    } catch (error) {
      localStorage.setItem("message", "Houve um erro ao salvar o cliente");
      localStorage.setItem("type", "error");
      navigate("/customers");
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            {isEditing ? "Editar Cliente" : "Cadastrar Cliente"}
          </legend>
          
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Nome*</label>
            <input type="text" id="name" name="name" value={customer.name} required onChange={handleChange} className={styles.input} placeholder="Nome do cliente" />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone_number" className={styles.label}>Telefone</label>
            <input type="tel" id="phone_number" name="phone_number" value={customer.phone_number || ""} onChange={handleChange} className={styles.input} placeholder="(99) 99999-9999" />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="birthday" className={styles.label}>Data de Nascimento</label>
            <input type="date" id="birthday" name="birthday" value={customer.birthday || ""} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="debt" className={styles.label}>Dívida</label>
            <input type="number" id="debt" name="debt" value={customer.debt} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="bought" className={styles.label}>Valor em compras</label>
            <input type="number" id="bought" name="bought" value={customer.bought} onChange={handleChange} className={styles.input} />
          </div>

          <button type="submit" className={styles.button}>
            {isEditing ? "Atualizar" : "Cadastrar"}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default CustomerForm;
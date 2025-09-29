import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosConfig";
import styles from "./Form.module.css";
import { CashflowTypes } from "../../types/cashflowTypes";

const CashflowForm: React.FC = () => {
  const [cashflow, setCashflow] = useState<CashflowTypes>({
    id: 0,
    category: "",
    value: 0,
    value_type: "",
    date: "",
    created_at: "",
    updated_at: "",
    description: "",
  });

  const [message, setMessage] = useState<{ msg: string; type: "success" | "error" | "info" }>({
    msg: "",
    type: "success",
  });

  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCashflow = async () => {
      if (isEditing) {
        try {
          // Lógica de token removida, o axiosInstance cuida disso.
          const response = await axiosInstance.get<CashflowTypes>(`/cashflow/${id}/`);
          setCashflow(response.data);
        } catch (error) {
          console.error("Erro ao carregar dados do fluxo de caixa.", error);
        }
      }
    };
    fetchCashflow();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCashflow(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const promise = isEditing
        ? axiosInstance.put(`/cashflow/${id}/`, cashflow)
        : axiosInstance.post(`/cashflow/`, cashflow);
      
      await promise;

      localStorage.setItem("message", `Registro ${isEditing ? 'atualizado' : 'criado'} com sucesso.`);
      localStorage.setItem("type", "success");
      navigate("/cashflow");
    } catch (error) {
      localStorage.setItem("message", `Erro ao ${isEditing ? 'atualizar' : 'criar'} o registro.`);
      localStorage.setItem("type", "error");
      navigate("/cashflow"); // Navega mesmo em caso de erro para ver a mensagem
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            {isEditing ? "Editar Registro" : "Novo Registro de Caixa"}
          </legend>
          
          <div className={styles.inputGroup}>
            <label htmlFor="category" className={styles.label}>Categoria*</label>
            <input type="text" id="category" name="category" value={cashflow.category} onChange={handleChange} required className={styles.input} placeholder="Ex: Pagamento de Fornecedor"/>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="value" className={styles.label}>Valor (R$)*</label>
            <input type="number" id="value" name="value" value={cashflow.value} onChange={handleChange} required className={styles.input} placeholder="Ex: 150.75" step="0.01"/>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="date" className={styles.label}>Data*</label>
            <input type="date" id="date" name="date" value={cashflow.date} onChange={handleChange} required className={styles.input}/>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="value_type" className={styles.label}>Tipo de Lançamento*</label>
            <select name="value_type" id="value_type" value={cashflow.value_type} onChange={handleChange} required className={styles.select}>
              <option value="" disabled>Selecione</option>
              <option value="EXPENSE">Despesa</option>
              <option value="PROFIT">Receita</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="description" className={styles.label}>Descrição</label>
            <input type="text" id="description" name="description" value={cashflow.description} onChange={handleChange} className={styles.input} placeholder="(Opcional)"/>
          </div>
          
          <button type="submit" className={styles.button}>{isEditing ? "Atualizar" : "Registrar"}</button>
        </fieldset>
      </form>
    </div>
  );
};

export default CashflowForm;
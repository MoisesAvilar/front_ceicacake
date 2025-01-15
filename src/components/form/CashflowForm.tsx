import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosConfig";
import { BASE_URL } from "../../services/api";
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
    if (isEditing) {
      fetchCashflow();
    }
  }, [id, isEditing]);

  const fetchCashflow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axiosInstance.get<CashflowTypes>(`${BASE_URL}/cashflow/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCashflow(response.data);
    } catch (error) {
      setMessage({
        msg: "Erro ao carregar dados do fluxo de caixa.",
        type: "error",
      });
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setCashflow((prevCashflow) => ({
      ...prevCashflow,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  
    try {
      if (isEditing) {
        await axiosInstance.put(`${BASE_URL}/cashflow/${id}/`, cashflow, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.setItem("message", "Fluxo de caixa atualizado com sucesso.");
        localStorage.setItem("type", "success");
      } else {
        await axiosInstance.post(`${BASE_URL}/cashflow/`, cashflow, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.setItem("message", "Fluxo de caixa registrado com sucesso.");
        localStorage.setItem("type", "success");
      }
  
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 3000);
  
      navigate("/cashflow");
    } catch (error) {
      localStorage.setItem("message", "Erro ao registrar ou atualizar o fluxo de caixa.");
      localStorage.setItem("type", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {isEditing ? "Editar Fluxo de Caixa" : "Registrar Fluxo de Caixa"}
        </legend>
        <label htmlFor="category" className={styles.label}>
          Categoria*
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={cashflow.category}
          onChange={handleChange}
          required
          className={styles.input}
          placeholder="Informe a categoria"
        />
        <label htmlFor="value" className={styles.label}>
          Valor*
        </label>
        <input
          type="number"
          id="value"
          name="value"
          value={cashflow.value}
          onChange={handleChange}
          required
          className={styles.input}
          placeholder="Informe o valor"
        />
        <label htmlFor="date" className={styles.label}>
          Data*
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={cashflow.date}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <label htmlFor="value_type" className={styles.label}>
          Tipo de Fluxo*
        </label>
        <select
          name="value_type"
          id="value_type"
          value={cashflow.value_type}
          onChange={handleChange}
          required
          className={styles.select}
          
        >
          <option value="" disabled>Selecione</option>
          <option value="EXPENSE">Gasto</option>
          <option value="PROFIT">Lucro</option>
        </select>
        <label htmlFor="description" className={styles.label}>
          Descrição
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={cashflow.description}
          onChange={handleChange}
          className={styles.input}
          placeholder="Opcional"
        />      
        <button type="submit" className={styles.button}>
          {isEditing ? "Atualizar" : "Registrar"}
        </button>
      </fieldset>
    </form>
  );
};

export default CashflowForm;

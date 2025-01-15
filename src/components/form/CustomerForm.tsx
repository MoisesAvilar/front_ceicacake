import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../services/api";
import axiosInstance from "../../services/axiosConfig";

import { CustomerTypes } from "../../types/customerTypes";

import styles from './Form.module.css'

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
      fetchCustomer();
    }
  }, [id, isEditing]);

  const fetchCustomer = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axiosInstance.get<CustomerTypes>(
        `${BASE_URL}/customers/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCustomer(response.data);
    } catch (error) {
      console.log("Houve um erro ao buscar o cliente:", error);
    }
  };

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setCustomer((prevCustomer) => ({
      ...prevCustomer,
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
        await axiosInstance.put(`${BASE_URL}/customers/${id}/`, customer, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.setItem("message", "Cliente atualizado com sucesso");
        localStorage.setItem("type", "success");
      } else {
        await axiosInstance.post(`${BASE_URL}/customers/`, customer, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.setItem("message", "Cliente cadastrado com sucesso");
        localStorage.setItem("type", "success");
      }
      navigate("/customers");
    } catch (error) {
      localStorage.setItem("message", "Houve um erro ao registrar o cliente");
      localStorage.setItem("type", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {isEditing ? "Editar Cliente" : "Cadastrar Cliente"}
        </legend>
        <label htmlFor="name" className={styles.label}>
          {isEditing ? "Nome" : "Nome*"}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={customer.name}
          required
          onChange={handleChange}
          className={styles.input}
          placeholder="Nome do cliente"
        />
        <label htmlFor="phone_number" className={styles.label}>
          Telefone
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={customer.phone_number || ""}
          onChange={handleChange}
          className={styles.input}
          placeholder="(99) 99999-9999"
        />
        <label htmlFor="birthday" className={styles.label}>
          Data de Nascimento
        </label>
        <input
          type="date"
          id="birthday"
          name="birthday"
          value={customer.birthday || ""}
          onChange={handleChange}
          className={styles.input}
        />
        <label htmlFor="debt" className={styles.label}>
          Dívida
        </label>
        <input
          type="number"
          id="debt"
          name="debt"
          value={customer.debt}
          onChange={handleChange}
          className={styles.input}
        />
        <label htmlFor="bought" className={styles.label}>
          Valor em compras
        </label>
        <input
          type="number"
          id="bought"
          name="bought"
          value={customer.bought}
          onChange={handleChange}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          {isEditing ? "Atualizar" : "Cadastrar"}
        </button>
      </fieldset>
    </form>
  );
};

export default CustomerForm;

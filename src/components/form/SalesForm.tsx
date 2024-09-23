import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosConfig";
import { SalesTypes } from "../../types/salesTypes";
import { PaymentStatus } from "../../services/payment_status";
import Products from "../../services/products";
import CustomersName from "../../services/customersName";
import { Product } from "../../services/productTypes"

import styles from "./Form.module.css";

const SalesForm: React.FC = () => {
  const [sales, setSales] = useState<SalesTypes>({
    product: "",
    price: 0,
    quantity: 0,
    customer: "",
    payment_status: "",
  });
  const [products, setProducts] = useState<Product[]>([]);

  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axiosInstance.get<Product[]>(`${BASE_URL}/products/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.log("Erro ao obter produtos:", error);
      }
    };

    fetchProducts();
  }, [navigate]);

  useEffect(() => {
    if (isEditing) {
      fetchSale();
    }
  }, [id, isEditing]);

  const fetchSale = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axiosInstance.get<SalesTypes>(
        `${BASE_URL}/sales/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSales(response.data);
    } catch (error) {
      console.log("Erro ao buscar a venda:", error);
    }
  };

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setSales((prevSales) => ({
      ...prevSales,
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
        await axiosInstance.put(`${BASE_URL}/sales/${id}`, sales, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.setItem("message", "Venda atualizada com sucesso");
        localStorage.setItem("type", "success");
      } else {
        await axiosInstance.post(`${BASE_URL}/sales/`, sales, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        localStorage.setItem("message", "Venda cadastrada com sucesso");
        localStorage.setItem("type", "success");
      }
      navigate("/sales");
    } catch (error) {
      console.log(
        `Ocorreu um erro ao ${isEditing ? "atualizar" : "cadastrar"} a venda:`,
        error
      );
      localStorage.setItem(
        "message",
        `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'cadastrar'} a venda:`
      );
      localStorage.setItem("type", "error");
    }
  };

  if (!isEditing && !sales) {
    return <div>Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {isEditing ? "Editar Venda" : "Registrar Venda"}
        </legend>
        <label htmlFor="product" className={styles.label}>
          Produto
        </label>
        <select
          name="product"
          id="product"
          value={sales.product}
          onChange={handleChange}
          required
          className={styles.select}
        >
          <option value="" disabled hidden>
            Selecione um produto
          </option>
          <Products products={products} />
        </select>
        <label htmlFor="price" className={styles.label}>
          Preço
        </label>
        <input
          type="number"
          id="price"
          name="price"
          placeholder="Informe o preço"
          value={sales.price}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <label htmlFor="quantity" className={styles.label}>
          Quantidade
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          placeholder="Informe a quantidade"
          value={sales.quantity}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <label htmlFor="customer" className={styles.label}>
          Cliente
        </label>
        <select
          name="customer"
          id="customer"
          value={sales.customer}
          onChange={(e) => setSales({ ...sales, customer: e.target.value })}
          required
          className={styles.select}
        >
          <option value="" disabled hidden>
            Selecione um cliente
          </option>
          <CustomersName />
        </select>
        <label htmlFor="payment_status" className={styles.label}>
          Status de pagamento
        </label>
        <select
          name="payment_status"
          id="payment_status"
          value={sales.payment_status}
          onChange={handleChange}
          required
          className={styles.select}
        >
          <option value="" disabled hidden>
            Selecione o status
          </option>
          {PaymentStatus.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.button}>
          {isEditing ? "Atualizar" : "Registrar"}
        </button>
      </fieldset>
    </form>
  );
};

export default SalesForm;

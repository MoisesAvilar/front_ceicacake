import React, { useState, useEffect } from "react";
import { BASE_URL } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import CustomersName from "../services/customersName";
import { Products } from "../services/products";
import { SalesTypes } from "../types/salesTypes";
import axiosInstance from "../services/axiosConfig";
import { PaymentStatus } from "../services/payment_status";

const SalesForm: React.FC = () => {
  const [sales, setSales] = useState<SalesTypes>({
    product: "",
    price: 0,
    quantity: 0,
    customer: "",
    payment_status: "",
  });

  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSales((prevSales) => ({
      ...prevSales,
      [name]: value || null,
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
        console.log("Venda atualizada com sucesso!");
      } else {
        await axiosInstance.post(`${BASE_URL}/sales/`, sales, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Venda registrada com sucesso!");
      }
      navigate("/sales");
    } catch (error) {
      console.log(
        `Ocorreu um erro ao ${isEditing ? "atualizar" : "cadastrar"} a venda:`,
        error
      );
    }
  };

  if (!isEditing && !sales) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>{isEditing ? "Editar Venda" : "Registrar Venda"}</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="product">Produto:</label>
        <select
          name="product"
          id="product"
          value={sales.product}
          onChange={(e) => setSales({ ...sales, product: e.target.value })}
        >
          {Products.map((product) => (
            <option key={product.value} value={product.value}>
              {product.label}
            </option>
          ))}
        </select>
        <label htmlFor="price">Preço:</label>
        <input
          type="number"
          id="price"
          name="price"
          value={sales.price}
          onChange={handleChange}
        />
        <label htmlFor="quantity">Quantidade:</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={sales.quantity}
          onChange={handleChange}
        />
        <label htmlFor="customer">Cliente:</label>
        <select
          name="customer"
          id="customer"
          value={sales.customer}
          onChange={(e) => setSales({ ...sales, customer: e.target.value })}
        >
          <CustomersName />
        </select>
        <label htmlFor="payment_status">Status de pagamento:</label>
        <select
          name="payment_status"
          id="payment_status"
          onChange={(e) =>
            setSales({ ...sales, payment_status: e.target.value })
          }
        >
          {PaymentStatus.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <button type="submit">{isEditing ? "Atualizar" : "Registrar"}</button>
      </form>
    </div>
  );
};

export default SalesForm;

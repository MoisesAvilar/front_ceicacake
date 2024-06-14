import React, { useEffect, useState } from "react";
import { BASE_URL } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosConfig";

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      getAllCustomers(token);
    }
  }, [navigate]);

  async function getAllCustomers(token: string) {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/customers/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Ocorreu um erro ao buscar clientes:", error);
    }
  }

  if (!customers) {
    return <div>Carregando</div>;
  }

  const formatPhoneNumber = (phoneNumber: string | null) => {
    if (!phoneNumber) return "N/A";
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
      2,
      7
    )}-${phoneNumber.slice(7)}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatBought = (bought: number) => {
    return bought.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div>
    <h2>Lista de Clientes</h2>
    {customers.length > 0 ? (
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>
            <strong>{customer.name}</strong> - Telefone:{" "}
            {formatPhoneNumber(customer.phone_number)} - Data de Nascimento:{" "}
            {formatDate(customer.birthday)} - Compras:{" "}
            {formatBought(customer.bought)}{" "}
            <Link to={`/customer/${customer.id}`}>Editar</Link>
          </li>
        ))}
      </ul>
    ) : (
      <p>
        Não há clientes cadastrados ainda.{" "}
        <Link to="/customer/new">Clique aqui</Link> para cadastrar um
        novo cliente.
      </p>
    )}
    <p>
      <Link to="/customer/new">Clique aqui</Link> para cadastrar um novo
      cliente.
    </p>
  </div>
  );
};

export default Customers;

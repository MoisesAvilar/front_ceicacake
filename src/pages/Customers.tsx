import React, { useEffect, useState } from "react";
import { BASE_URL } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosConfig";

import Message from "../layout/Message";
import { MessageProps } from "../types/messageTypes";

import styles from "./Customers.module.css";

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [message, setMessage] = useState<MessageProps>({
    msg: "",
    type: "success",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      getAllCustomers(token);
    }
  }, [navigate]);

  useEffect(() => {
    const storedMessage = localStorage.getItem("message");
    const storedType = localStorage.getItem("type");
    if (storedMessage && storedType) {
      setMessage({
        msg: storedMessage as string,
        type: storedType as "success" | "error" | "info",
      });
    }
    setTimeout(() => {
      localStorage.removeItem("message");
      localStorage.removeItem("type");
      setMessage({ msg: "", type: "success" });
    }, 3000);
  }, []);

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

  const handleDeleteCustomer = async (id: string) => {
    const confirmDelete = window.confirm("Deseja realmente excluir?");
    if (!confirmDelete) {
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axiosInstance.delete(`${BASE_URL}/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage({ msg: "Cliente excluido com sucesso.", type: "success" });
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 3000);
      getAllCustomers(token);
    } catch (error) {
      console.log("Erro ao excluir cliente:", error);
      setMessage({ msg: "Erro ao excluir cliente.", type: "error" });
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 3000);
    }
  };

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

  return (
    <>
      <div className={styles.container}>
        {message.msg && <Message msg={message.msg} type={message.type} />}
        <div className={styles.header}>
          <h2>Clientes</h2>
          <Link to="/customer/new" className={styles.link}>
            Cadastrar cliente
          </Link>
        </div>
        {customers.length > 0 ? (
          <ul className={styles.customersList}>
            {customers.map((customer) => (
              <li key={customer.id} className={styles.customerItem}>
                <div>
                  <strong>Nome:</strong>
                  <strong>
                    <Link
                      to={`/customer/${customer.id}`}
                      className={styles.link}
                    >
                      {customer.name}
                    </Link>
                  </strong>
                </div>
                <div>
                  <strong>Telefone:</strong>
                  {formatPhoneNumber(customer.phone_number)}
                </div>
                <div>
                  <strong>Data deNascimento:</strong>
                  {formatDate(customer.birthday)}
                </div>
                <div>
                  <strong>Compras:</strong>
                  {customer.bought.toFixed(2).replace(".", ",")}
                </div>
                <div className={styles.customerActions}>
                  <Link
                    to={`/customer/${customer.id}`}
                    className={`${styles.button} ${styles.edit}`}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className={`${styles.button} ${styles.delete}`}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há clientes cadastrados ainda.</p>
        )}
      </div>
    </>
  );
};

export default Customers;

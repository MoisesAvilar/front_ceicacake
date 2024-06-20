import { format, parseISO } from "date-fns";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosConfig";

import styles from "./Sales.module.css";
import Message from "../layout/Message";
import { MessageProps } from "../types/messageTypes";

const Sales: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set());
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
      getSales(token);
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

  async function getSales(token: string) {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/sales/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSales(response.data);
    } catch (error) {
      console.log("Ocorreu um erro:", error);
    }
  }

  const handleDeleteSale = async (id: string) => {
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
      await axiosInstance.delete(`${BASE_URL}/sales/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      getSales(token);
      setMessage({ msg: "Venda excluída com sucesso", type: "info" });
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.log("Erro ao excluir a venda:", error);
      setMessage({ msg: "Erro ao excluir a venda", type: "error" });
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 3000);
    }
  };

  const handleDeleteSelectedSales = async () => {
    const confirmDelete = window.confirm(
      `Deseja realmente excluir ${selectedSales.size} vendas?`
    );
    if (!confirmDelete) {
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      for (let saleId of selectedSales) {
        await axiosInstance.delete(`${BASE_URL}/sales/${saleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setMessage({ msg: "Vendas excluídas com sucesso!", type: "info" });
      getSales(token);
      setSelectedSales(new Set());
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.log("Erro ao excluir as vendas:", error);
      setMessage({ msg: "Erro ao excluir as vendas.", type: "error" });
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 3000);
    }
  };

  const handleSelectedSales = (id: string) => {
    setSelectedSales((prevSelectedSales) => {
      const newSelectedSales = new Set(prevSelectedSales);
      if (newSelectedSales.has(id)) {
        newSelectedSales.delete(id);
      } else {
        newSelectedSales.add(id);
      }
      return newSelectedSales;
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    const parsedDate = parseISO(date);
    return  format(parsedDate, "dd/MM/yyyy - HH:mm");
  }

  const toCapitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLocaleLowerCase();
  };

  return (
    <>
      <div className={styles.container}>
        {message.msg && <Message msg={message.msg} type={message.type} />}
        <div className={styles.header}>
          <h2>Vendas</h2>
          <Link to="/sales/new" className={styles.link}>
            Registrar Venda
          </Link>
        </div>
        {selectedSales.size > 1 && (
          <button
            onClick={handleDeleteSelectedSales}
            className={`${styles.delete} ${styles.button} ${styles.deleteSales}`}
          >
            Excluir {selectedSales.size} Venda(s)
          </button>
        )}
        {sales.length > 0 ? (
          <ul className={styles.salesList}>
            {sales
              .map((sale) => (
                <li key={sale.id} className={styles.saleItem}>
                  <input
                    type="checkbox"
                    name="saleId"
                    id={`saleId-${sale.id}`}
                    value={sale.id}
                    checked={selectedSales.has(sale.id)}
                    onChange={() => handleSelectedSales(sale.id)}
                    className={styles.checkbox}
                  />
                  <label htmlFor={`saleId-${sale.id}`} className={styles.checkboxLabel}></label>
                  <div>
                    <strong>Produto:</strong> {sale.product_name}
                  </div>
                  <div>
                    <strong>Preço:</strong> R$
                    {sale.price.toFixed(2).replace(".", ",")}
                  </div>
                  <div>
                    <strong>Quantidade:</strong> {sale.quantity}
                  </div>
                  <div>
                    <strong>Cliente:</strong>
                    {sale.customer_name}
                  </div>
                  <div>
                    <strong>Data:</strong>{" "}
                    {formatDate(sale.data_hour)}
                  </div>
                  <div>
                    <strong>Status do Pagamento:</strong>{" "}
                    {toCapitalize(sale.payment_status)}
                  </div>
                  <div>
                    <strong>Total:</strong> R$
                    {sale.total.toFixed(2).replace(".", ",")}
                  </div>
                  <div className={styles.saleActions}>
                    <button
                      onClick={() => navigate(`/sales/${sale.id}`)}
                      className={`${styles.edit} ${styles.button}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSale(sale.id)}
                      className={`${styles.delete} ${styles.button}`}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))
              .reverse()}
          </ul>
        ) : (
          <p>Não há vendas cadastradas ainda.</p>
        )}
      </div>
    </>
  );
};

export default Sales;

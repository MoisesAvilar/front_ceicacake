import React, { useEffect, useState, useRef } from "react";
import { format, parseISO } from "date-fns";
import { BASE_URL } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosConfig";
import styles from "./Sales.module.css";
import Message from "../layout/Message";
import { MessageProps } from "../types/messageTypes";
import CapitalizeText from "../components/CapitalizeText";

const Sales: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [selectedSales, setSelectedSales] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<MessageProps>({
    msg: "",
    type: "success",
  });

  const [filterClient, setFilterClient] = useState<string>("");
  const [filterProduct, setFilterProduct] = useState<string>("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [uniqueClients, setUniqueClients] = useState<string[]>([]);
  const [uniqueProducts, setUniqueProducts] = useState<string[]>([]);
  const [uniquePaymentStatus, setUniquePaymentStatus] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  const filterRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      filterRef.current &&
      !filterRef.current.contains(event.target as Node) &&
      showFilters
    ) {
      setShowFilters(false);
    }
    event.stopPropagation();
  };

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
      setMessage({ msg: "Erro ao excluir as vendas.", type: "error" });
      setTimeout(() => {
        setMessage({ msg: "", type: "success" });
      }, 3000);
    }
  };

  const handleUpdateSelectedSalesStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    for (let saleId of selectedSales) {
      try {
        const response = await axiosInstance.get(
          `${BASE_URL}/sales/${saleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const saleData = response.data;
        const updatedSale = {
          ...saleData,
          payment_status: "PAGO",
        };

        await axiosInstance.patch(`${BASE_URL}/sales/${saleId}`, updatedSale, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessage({
          msg:
            selectedSales.size === 1
              ? "Venda atualizada com sucesso"
              : "Vendas atualizadas com sucesso",
          type: "info",
        });

        setTimeout(() => {
          setMessage({ msg: "", type: "success" });
        }, 3000);
      } catch (error) {
        setMessage({
          msg:
            selectedSales.size === 1
              ? "Erro ao atualizar a venda"
              : "Erro ao atualizar as vendas",
          type: "error",
        });

        setTimeout(() => {
          setMessage({ msg: "", type: "success" });
        }, 3000);
      }
    }

    getSales(token);
    setSelectedSales(new Set());
  };

  const handleSelectedSales = (id: number) => {
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

  const handleSortByDate = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    const parsedDate = parseISO(date);
    return format(parsedDate, "dd/MM/yyyy - HH:mm");
  };

  useEffect(() => {
    const getUniqueOptions = (sales: any[], field: string): string[] => {
      const uniqueOptions = sales.reduce((acc: string[], sale) => {
        if (sale[field] && !acc.includes(sale[field])) {
          acc.push(sale[field]);
        }
        return acc;
      }, []);
      return uniqueOptions;
    };

    if (sales.length > 0) {
      setUniqueClients(getUniqueOptions(sales, "customer_name"));
      setUniqueProducts(getUniqueOptions(sales, "product_name"));
      setUniquePaymentStatus(getUniqueOptions(sales, "payment_status"));
    }
  }, [sales]);

  return (
    <>
      <div className={styles.container}>
        {message.msg && <Message msg={message.msg} type={message.type} />}
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>Vendas</h2>
            <Link to="/sales/new" className={styles.link}>
              Registrar Venda
            </Link>
          </div>
          <div className={styles.buttonContainer}>
            <button
              className={styles.filterButton}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Fechar Filtro" : "Filtrar"}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filterOverlay}></div>
        )}

        {showFilters && (
          <div className={styles.filtersContainer}>
            <div ref={filterRef} className={styles.filters}>
              <label htmlFor="filterClient">Filtrar por Cliente:</label>
              <select
                id="filterClient"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              >
                <option value="">Todos os Clientes</option>
                {uniqueClients.map((client, index) => (
                  <option key={index} value={client}>
                    {<CapitalizeText text={client} />}
                  </option>
                ))}
              </select>
              <label htmlFor="filterProduct">Filtrar por Produto:</label>
              <select
                id="filterProduct"
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
              >
                <option value="">Todos os Produtos</option>
                {uniqueProducts.map((product, index) => (
                  <option key={index} value={product}>
                    {product}
                  </option>
                ))}
              </select>
              <label htmlFor="filterPaymentStatus">
                Filtrar por Status de Pagamento:
              </label>
              <select
                id="filterPaymentStatus"
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
              >
                <option value="">Todos os Status</option>
                {uniquePaymentStatus.map((status, index) => (
                  <option key={index} value={status}>
                    {<CapitalizeText text={status} />}
                  </option>
                ))}
              </select>
              <button
                className={`${styles.button} ${styles.edit}`}
                onClick={handleSortByDate}
              >
                Ordenar por Data {sortDirection === "asc" ? "↓" : "↑"}
              </button>
              {sales.length > 0 ? (
                <ul className={styles.salesList}></ul>
              ) : (
                <p>Não há vendas cadastradas ainda.</p>
              )}
            </div>
          </div>
        )}

        {selectedSales.size >= 1 && (
          <div>
            <button
              onClick={handleDeleteSelectedSales}
              className={`${styles.delete} ${styles.button} ${styles.deleteSales}`}
            >
              Excluir {selectedSales.size}{" "}
              {selectedSales.size === 1 ? "venda" : "vendas"}
            </button>
          </div>
        )}
        {selectedSales.size >= 1 && (
          <div>
            <button
              onClick={handleUpdateSelectedSalesStatus}
              className={`${styles.edit} ${styles.button} ${styles.updateSales}`}
            >
              Atualizar {selectedSales.size}{" "}
              {selectedSales.size === 1
                ? "item como pago"
                : "itens como pago"}
            </button>
          </div>
        )}
        {sales.length > 0 ? (
          <ul className={styles.salesList}>
            {sales
              .filter(
                (sale) =>
                  (filterClient
                    ? sale.customer_name
                        .toLowerCase()
                        .includes(filterClient.toLowerCase())
                    : true) &&
                  (filterProduct
                    ? sale.product_name
                        .toLowerCase()
                        .includes(filterProduct.toLowerCase())
                    : true) &&
                  (filterPaymentStatus
                    ? sale.payment_status
                        .toLowerCase()
                        .includes(filterPaymentStatus.toLowerCase())
                    : true)
              )
              .sort((a, b) => {
                const dateA = new Date(a.data_hour).getTime();
                const dateB = new Date(b.data_hour).getTime();
                return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
              })
              .map((sale) => (
                <li
                  key={sale.id}
                  className={styles.saleItem}
                  onClick={() => handleSelectedSales(sale.id)}
                >
                  <input
                    type="checkbox"
                    name="saleId"
                    id={`saleId-${sale.id}`}
                    value={sale.id}
                    checked={selectedSales.has(sale.id)}
                    onChange={() => handleSelectedSales(sale.id)}
                    className={styles.checkbox}
                  />
                  <label
                    htmlFor={`saleId-${sale.id}`}
                    className={styles.checkboxLabel}
                  ></label>
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
                    <strong>Cliente:</strong>{" "}
                    {<CapitalizeText text={sale.customer_name} />}
                  </div>
                  <div>
                    <strong>Data:</strong> {formatDate(sale.data_hour)}
                  </div>
                  <div>
                    <strong>Pagamento:</strong>{" "}
                    <span
                      style={{
                        backgroundColor:
                          sale.payment_status === "PAGO" ? "green" : "red",
                        color: "white",
                        padding: "5px 5px",
                        borderRadius: "4px",
                      }}
                    >
                      <CapitalizeText text={sale.payment_status} />
                    </span>
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

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { BASE_URL } from "../services/api";
import axiosInstance from "../services/axiosConfig";
import CapitalizeText from "../components/CapitalizeText";
import styles from "./Cashflow.module.css";
import { CashflowTypes } from "../types/cashflowTypes";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import Message from "../layout/Message";
import Loading from "../components/Loading";

const Cashflow: React.FC = () => {
  const [cashflowData, setCashflowData] = useState<CashflowTypes[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ msg: string; type: "success" | "error" | "info" }>({
    msg: "",
    type: "success",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedMessage = localStorage.getItem("message");
    const storedType = localStorage.getItem("type");

    if (storedMessage && storedType) {
      setMessage({
        msg: storedMessage,
        type: storedType as "success" | "error" | "info",
      });
      localStorage.removeItem("message");
      localStorage.removeItem("type");
    }

    const timer = setTimeout(() => {
      setMessage({ msg: "", type: "success" });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCashflowData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get(`${BASE_URL}/cashflow/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCashflowData(response.data);
      } catch (err) {
        setError("Falha ao buscar os dados de fluxo de caixa.");
        setMessage({ msg: "Erro ao buscar dados de fluxo de caixa.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchCashflowData();
  }, []);

  const formatDate = (date: string) => {
    const parsedDate = parseISO(date);
    return format(parsedDate, "dd/MM/yyyy");
  };

  return (
    <div className={styles.container}>
      {message.msg && <Message msg={message.msg} type={message.type} />}
      <div className={styles.header}>
        <h2>Fluxo de Caixa</h2>
        <Link to="/cashflow/new/" className={styles.link}>
          Registrar Novo
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.content}>
          {cashflowData.length > 0 ? (
            <div className={styles.cardContainer}>
              {cashflowData
                .map((item, index) => (
                  <div key={index} className={styles.card}>
                    <div className={styles.cardItem}>
                      <strong>Categoria:</strong>{" "}
                      <CapitalizeText text={item.category} />
                    </div>
                    <div className={styles.cardItem}>
                      <strong>Tipo:</strong>{" "}
                      {item.value_type === "EXPENSE" ? "Gasto" : "Lucro"}
                    </div>
                    <div className={styles.cardItem}>
                      <strong>Valor:</strong> R${Number(item.value).toFixed(2).replace(".", ",")}
                    </div>
                    <div className={styles.cardItem}>
                      <strong>Data de Registro:</strong> {formatDate(item.date)}
                    </div>
                    <div className={styles.cardItem}>
                      <strong>Descrição:</strong>{" "}
                      <CapitalizeText text={item.description || "Sem descricao"} />
                    </div>
                    <div className={styles.cardItem}>
                      <strong>Atualizado em:</strong> {formatDate(item.updated_at)}
                    </div>
                    <div className={styles.cardItem}>
                      <strong>Criado em:</strong> {formatDate(item.created_at)}
                    </div>
                    <div className={styles.cashflowActions}>
                      <button
                        onClick={() => navigate(`/cashflow/${item.id}`)}
                        className={`${styles.edit} ${styles.button}`}
                      >
                        <FaEdit /> Editar
                      </button>
                    </div>
                  </div>
                ))
                .reverse()}
            </div>
          ) : (
            <h2>Não há dados de fluxo de caixa.</h2>
          )}
        </div>
      )}
    </div>
  );
};

export default Cashflow;

import React, { useEffect, useState } from "react";
import { BASE_URL } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosConfig";

const Sales: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      getSales(token);
    }
  }, [navigate]);

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

  return (
    <div>
      <h1>Vendas</h1>
      <Link to="/sales/new">Registrar Venda</Link>
      {sales.length > 0 ? (
        <ul>
          {sales.map((sale, index) => (
            <li key={sale.id}>
              {index}
              <div>
                <strong>Produto:</strong> {sale.product_name}
              </div>
              <div>
                <strong>Preço:</strong> R${sale.price.toFixed(2)}
              </div>
              <div>
                <strong>Quantidade:</strong> {sale.quantity}
              </div>
              <div>
                <strong>Cliente:</strong> {sale.customer_name}
              </div>
              <div>
                <strong>Data e Hora:</strong>{" "}
                {new Date(sale.data_hour).toLocaleString()}
              </div>
              <div>
                <strong>Status do Pagamento:</strong> {sale.payment_status}
              </div>
              <div>
                <strong>Total:</strong> R${sale.total.toFixed(2)}
              </div>
              <div>
                <Link to={`/sales/${sale.id}`}>Editar</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Não há vendas cadastradas ainda.</p>
      )}
    </div>
  );
};

export default Sales;

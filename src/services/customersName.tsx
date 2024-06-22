import React, { useEffect, useState } from "react";
import { BASE_URL } from "./api";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosConfig";
import CapitalizeText from "../components/CapitalizeText";

const CustomersName: React.FC = () => {
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

  return (
    <>
      {customers.length > 0 ? (
        customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {<CapitalizeText text={customer.name} />}
          </option>
        ))
      ) : (
        <option value="">Carregando clientes...</option>
      )}
    </>
  );
};

export default CustomersName;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../services/api";
import { CustomerTypes } from "../types/customerTypes";
import axiosInstance from "../services/axiosConfig";

const CustomerForm: React.FC = () => {
  const [customer, setCustomer] = useState<CustomerTypes>({
    name: "",
    phoneNumber: null,
    birthday: null,
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
        `${BASE_URL}/customers/${id}`,
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCustomer((prevCustomer) => ({
      ...prevCustomer,
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
        await axiosInstance.put(`${BASE_URL}/customers/${id}`, customer, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Cliente atualizado com sucesso!");
      } else {
        await axiosInstance.post(`${BASE_URL}/customers/`, customer, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Cliente cadastrado com sucesso!");
      }
      navigate("/customers");
    } catch (error) {
      console.log(
        `Ocorreu um erro ao ${
          isEditing ? "atualizar" : "cadastrar"
        } o cliente:`,
        error
      );
    }
  };

  return (
    <div>
      <h2>{isEditing ? "Editar Cliente" : "Cadastro de Clientes"}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nome:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={customer.name}
          required
          onChange={handleChange}
        />
        <label htmlFor="phone_number">Telefone:</label>
        <input
          type="tel"
          id="phone_number"
          name="phoneNumber"
          value={customer.phoneNumber || ""}
          onChange={handleChange}
        />
        <label htmlFor="birthday">Data de Nascimento:</label>
        <input
          type="date"
          id="birthday"
          name="birthday"
          value={customer.birthday || ""}
          onChange={handleChange}
        />
        <label htmlFor="bought">Compras:</label>
        <input
          type="number"
          id="bought"
          name="bought"
          value={customer.bought}
          onChange={handleChange}
        />
        <button type="submit">{isEditing ? "Atualizar" : "Cadastrar"}</button>
      </form>
    </div>
  );
};

export default CustomerForm;

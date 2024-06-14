import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  });

  return <div>
    <h1>Bem vindo {localStorage.getItem("username")}</h1>
    <h2>Selecione uma das opções abaixo</h2>
    <ul>
      <li><Link to="/sales">Vendas</Link></li>
      <li><Link to="/sales/new">Registrar Venda</Link></li>
      <li><Link to="/customers">Clientes</Link></li>
    </ul>
  </div>;
};

export default Home;

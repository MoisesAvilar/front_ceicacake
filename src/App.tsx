import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./services/Login";
import Sales from "./pages/Sales";
import SalesForm from "./pages/SalesForm";

import NavBar from "./layout/NavBar";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/CustomerForm";

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/new" element={<SalesForm />} />
        <Route path="/sales/:id" element={<SalesForm />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customer/new" element={<CustomerForm />} />
        <Route path="/customer/:id" element={<CustomerForm />} />
      </Routes>
    </Router>
  );
};

export default App;

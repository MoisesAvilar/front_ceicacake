import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./services/Login";
import Sales from "./pages/Sales";
import SalesForm from "./components/form/SalesForm";
import Dashboard from "./pages/Dashboard";

import NavBar from "./layout/NavBar";
import Customers from "./pages/Customers";
import CustomerForm from "./components/form/CustomerForm";

import Container from "./components/Container";
import Footer from "./layout/Footer";
import NotFound from "./components/notFound";

import Cashflow from "./pages/Cashflow";
import CashflowForm from "./components/form/CashflowForm";

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/new" element={<SalesForm />} />
          <Route path="/sales/:id" element={<SalesForm />} />
          <Route path="/sales/chart" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customer/new" element={<CustomerForm />} />
          <Route path="/customer/:id" element={<CustomerForm />} />
          <Route path="/cashflow" element={<Cashflow />} />
          <Route path="/cashflow/new" element={<CashflowForm />} />
          <Route path="/cashflow/:id" element={<CashflowForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Container>
    </Router>
  );
};

export default App;

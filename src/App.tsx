import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./services/Login";
import Sales from "./pages/Sales";
import SalesForm from "./components/form/SalesForm";
import Dashboard from "./pages/Dashboard";

import NavBar from "./layout/NavBar";
import Customers from "./pages/Customers";
import CustomerForm from "./components/form/CustomerForm";
import CustomerDetail from "./pages/CustomerDetail";

import Container from "./components/Container";
import Footer from "./layout/Footer";
import NotFound from "./components/notFound";

import Cashflow from "./pages/Cashflow";
import CashflowForm from "./components/form/CashflowForm";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Container>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas Protegidas */}
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
            <Route path="/sales/new" element={<PrivateRoute><SalesForm /></PrivateRoute>} />
            <Route path="/sales/:id" element={<PrivateRoute><SalesForm /></PrivateRoute>} />
            <Route path="/sales/chart" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
            <Route path="/customer/new" element={<PrivateRoute><CustomerForm /></PrivateRoute>} />
            <Route path="/customer/:id" element={<PrivateRoute><CustomerDetail /></PrivateRoute>} />
            <Route path="/cashflow" element={<PrivateRoute><Cashflow /></PrivateRoute>} />
            <Route path="/cashflow/new" element={<PrivateRoute><CashflowForm /></PrivateRoute>} />
            <Route path="/cashflow/:id" element={<PrivateRoute><CashflowForm /></PrivateRoute>} />
            
            {/* Rota pública para página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </Container>
      </AuthProvider>
    </Router>
  );
};

export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./services/Login";
import Sales from "./pages/Sales";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Cashflow from "./pages/Cashflow";

import NavBar from "./layout/NavBar";
import Container from "./components/Container";
import Footer from "./layout/Footer";
import NotFound from "./components/notFound";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Container>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
            <Route path="/sales/chart" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            
            <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
            <Route path="/customer/:id" element={<PrivateRoute><CustomerDetail /></PrivateRoute>} />
            
            <Route path="/cashflow" element={<PrivateRoute><Cashflow /></PrivateRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </Container>
      </AuthProvider>
    </Router>
  );
};

export default App;
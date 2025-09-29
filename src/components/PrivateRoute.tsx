import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// O tipo React.PropsWithChildren permite que o componente aceite filhos (children)
const PrivateRoute = ({ children }: React.PropsWithChildren) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Enquanto verifica a autenticação, não renderize nada ou mostre um spinner
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Se estiver autenticado, renderiza o componente filho (a página)
  return <>{children}</>;
};

export default PrivateRoute;
import { ReactNode } from "react";
import styles from "./Container.module.css"; // Atualizado para usar o módulo

interface ContainerProps {
  children: ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  // Atualizado para usar a classe do módulo
  return <div className={styles.container}>{children}</div>;
};

export default Container;
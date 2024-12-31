
import React from "react";
import SalesByProductChart from "../components/charts/SalesByProductChart";
import SalesByClientChart from "../components/charts/SalesByClientChart";
import SalesByPeriodChart from "../components/charts/SalesByPeriodChart";
import styles from './Dashboard.module.css';


const DashboardPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Dashboard de Vendas</h2>
      </div>
      <SalesByProductChart />
      <SalesByClientChart />
      <SalesByPeriodChart />
    </div>
  );
};

export default DashboardPage;

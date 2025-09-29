// Dashboard.tsx

import React, { useState } from "react";
import SalesByProductChart from "../components/charts/SalesByProductChart";
import SalesByClientChart from "../components/charts/SalesByClientChart";
import SalesByPeriodChart from "../components/charts/SalesByPeriodChart";
import PeriodSelector from "../components/PeriodSelector"; // 1. Importar o PeriodSelector
import styles from './Dashboard.module.css';

const themeColors = {
  textColor: '#EAEAEA',
  gridColor: '#3A3A3A',
  primaryColor: '#6A3FFB',
  secondaryColor: '#10B981',
  tooltipBgColor: '#1E1E1E',
};

const DashboardPage: React.FC = () => {
  // 2. Criar o estado do período aqui
  const [period, setPeriod] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 3. Callback para ser usado pelo PeriodSelector para atualizar o estado
  const handlePeriodChange = (startDate: string, endDate: string) => {
    setPeriod({ startDate, endDate });
  };
  
  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>Dashboard de Vendas</h1>
      </header>
      
      {/* 4. Renderizar o PeriodSelector aqui no topo */}
      <div className={styles.periodSelectorContainer}>
        <PeriodSelector onChange={handlePeriodChange} />
      </div>
      
      <div className={styles.dashboardGrid}>
        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
          <h2 className={styles.chartTitle}>Vendas ao Longo do Tempo</h2>
          {/* 5. Passar as datas como props para os gráficos */}
          <SalesByPeriodChart {...themeColors} startDate={period.startDate} endDate={period.endDate} />
        </div>

        <div className={styles.chartCard}>
           <h2 className={styles.chartTitle}>Vendas por Produto</h2>
           <SalesByProductChart {...themeColors} startDate={period.startDate} endDate={period.endDate} />
        </div>

        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Vendas por Cliente</h2>
          <SalesByClientChart {...themeColors} startDate={period.startDate} endDate={period.endDate} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
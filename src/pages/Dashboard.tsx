import React, { useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

import PeriodSelector from '../components/PeriodSelector';
import SalesByPeriodChart from '../components/charts/SalesByPeriodChart';
import SalesByProductChart from '../components/charts/SalesByProductChart';
import SalesByClientChart from '../components/charts/SalesByClientChart';

import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  // O Estado global da data começa no mês atual por padrão
  const [period, setPeriod] = useState({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const handlePeriodChange = useCallback((startDate: string, endDate: string) => {
    setPeriod({ startDate, endDate });
  }, []);

  // Centralizamos as cores para manter consistência nos gráficos do Chart.js
  const chartStyles = {
    textColor: '#4b5563', // Cor suave para textos (eixos e legendas)
    gridColor: '#f3f4f6', // Linhas de fundo muito sutis
    primaryColor: '#6a3ffb', // Sua cor primária (roxo/azul)
    secondaryColor: '#10b981', // Verde sucesso para contraste de unidades
    tooltipBgColor: '#e6e6e6', // Fundo do hover (escuro)
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>Métricas e Relatórios</h1>
        <div className={styles.filters}>
          <PeriodSelector 
            onChange={handlePeriodChange} 
            // Caso o seu PeriodSelector suporte valores iniciais:
            // initialStartDate={period.startDate} 
            // initialEndDate={period.endDate} 
          />
        </div>
      </header>

      <div className={styles.dashboardGrid}>
        {/* Gráfico 1: Linha do Tempo (Ocupa as duas colunas no Desktop) */}
        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Faturamento e Volume no Período</h2>
          <SalesByPeriodChart 
            startDate={period.startDate} 
            endDate={period.endDate} 
            {...chartStyles} 
          />
        </div>

        {/* Gráfico 2: Produtos (Metade da tela no Desktop) */}
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Desempenho por Produto</h2>
          <SalesByProductChart 
            startDate={period.startDate} 
            endDate={period.endDate} 
            {...chartStyles} 
          />
        </div>

        {/* Gráfico 3: Clientes (Metade da tela no Desktop) */}
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Distribuição por Cliente</h2>
          <SalesByClientChart 
            startDate={period.startDate} 
            endDate={period.endDate} 
            {...chartStyles} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
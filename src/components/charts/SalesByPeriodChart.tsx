import React, { useEffect, useState } from 'react';
import Chart from '../common/Chart';
import { fetchSalesByPeriod } from '../../services/salesService';
import PeriodSelector from '../PeriodSelector';
import { fetchProducts } from '../../services/salesService';
import { TooltipItem } from 'chart.js';
import styles from '../common/Chart.module.css';

interface SalesData {
  product: string;
  total_sales: number;
  quantity_sold: number;
}

const SalesByPeriodChart: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [products, setProducts] = useState<{ value: string; label: string }[]>([]);
  const [period, setPeriod] = useState({ startDate: '2024-03-06', endDate: '' });

  const adjustEndDate = (date: string) => {
    const adjusted = new Date(date);
    adjusted.setDate(adjusted.getDate() + 1);
    return adjusted.toISOString().split("T")[0];
  };

  useEffect(() => {
    fetchProducts().then((productData) => setProducts(productData));

    const today = new Date();
    const formattedEndDate = today.toISOString().split('T')[0];
    setPeriod({ startDate: '2024-03-06', endDate: formattedEndDate });

    fetchSalesByPeriod('2024-03-06', formattedEndDate).then((data) => setSalesData(data));
  }, []);

  useEffect(() => {
    if (period.startDate && period.endDate) {
      const adjustedEndDate = adjustEndDate(period.endDate);
      fetchSalesByPeriod(period.startDate, adjustedEndDate).then((data) => {
        setSalesData(data);
      });
    }
  }, [period]);

  const handlePeriodChange = (startDate: string, endDate: string) => {
    setPeriod({ startDate, endDate });
  };

  const totalSales = salesData.reduce((sum, sale) => sum + sale.total_sales, 0);
  const totalUnits = salesData.reduce((sum, sale) => sum + sale.quantity_sold, 0);

  const chartData = {
    labels: salesData.map((sale) => {
      const product = products.find((p) => p.value === sale.product);
      return product ? product.label : sale.product;
    }),
    datasets: [
      {
        label: 'Total de Vendas',
        data: salesData.map((sale) => sale.total_sales),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Quantidade Vendida',
        data: salesData.map((sale) => sale.quantity_sold),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        type: 'line' as 'line',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 5,
    plugins: {
      title: {
        display: true,
        text: 'Vendas por Período',
        font: {
          size: 24,
          weight: 'bold',
          family: 'Arial',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          size: 18,
          weight: 'bold',
          family: 'Arial',
        },
        bodyFont: {
          size: 16,
          family: 'Arial',
        },
        callbacks: {
          label: (tooltipItem: TooltipItem<'line'>) => {
            const datasetIndex = tooltipItem.datasetIndex;
            const value = tooltipItem.raw;

            if (datasetIndex === 0 && typeof value === 'number') {
              return `R$${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
            } else if (datasetIndex === 1 && typeof value === 'number' && value === 1) {
              return `${value} unidade`;
            } else {
              return `${value} unidades`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className={styles.mainChartWrapper}>
      <div className={styles.chartWithFilter}>
        <PeriodSelector onChange={handlePeriodChange} />
        <div className={styles.totals}>
          <p>
            <span className={styles["totals-icon"]}>💰</span>
            <strong>Total Vendido:</strong> R$
            {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(totalSales)}
          </p>
          <p>
            <span className={styles["totals-icon"]}>📦</span>
            <strong>Quantidade Total:</strong> {totalUnits} unidades
          </p>
        </div>

        <Chart type="line" data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SalesByPeriodChart;

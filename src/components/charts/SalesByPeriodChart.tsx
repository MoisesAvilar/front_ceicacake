import React, { useEffect, useState } from 'react';
import Chart from '../common/Chart';
import { fetchSalesByPeriod, fetchProducts } from '../../services/salesService';
// O PeriodSelector não é mais necessário aqui
import { TooltipItem } from 'chart.js';
import styles from '../common/Chart.module.css';

interface ChartStyleProps {
  textColor: string;
  gridColor: string;
  primaryColor: string;
  secondaryColor: string;
  tooltipBgColor: string;
  // 1. Receber startDate e endDate como props
  startDate: string;
  endDate: string;
}

const SalesByPeriodChart: React.FC<ChartStyleProps> = ({ textColor, gridColor, primaryColor, secondaryColor, tooltipBgColor, startDate, endDate }) => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [products, setProducts] = useState<{ value: string; label: string }[]>([]);
  // 2. O estado 'period' foi removido

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  useEffect(() => {
    // 3. Usar as props 'startDate' e 'endDate' para buscar os dados
    if (startDate && endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      fetchSalesByPeriod(startDate, adjustedEndDate.toISOString().split("T")[0]).then(setSalesData);
    }
  }, [startDate, endDate]); // 4. O useEffect agora depende das props

  const totalSales = salesData.reduce((sum, sale) => sum + sale.total_sales, 0);
  const totalUnits = salesData.reduce((sum, sale) => sum + sale.quantity_sold, 0);


  const chartData = {
    labels: salesData.map(sale => products.find(p => p.value === sale.product)?.label || sale.product),
    datasets: [
      {
        label: 'Total de Vendas (R$)',
        data: salesData.map(sale => sale.total_sales),
        backgroundColor: `${primaryColor}33`, // Cor primária com 20% de opacidade
        borderColor: primaryColor,
        borderWidth: 2,
        type: 'bar' as const,
      },
      {
        label: 'Quantidade Vendida',
        data: salesData.map(sale => sale.quantity_sold),
        backgroundColor: secondaryColor,
        borderColor: secondaryColor,
        borderWidth: 2,
        type: 'line' as const,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { family: 'Inter, sans-serif' } } },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: textColor,
        bodyColor: textColor,
        titleFont: { size: 16, weight: 'bold', family: 'Inter, sans-serif' },
        bodyFont: { size: 14, family: 'Inter, sans-serif' },
        callbacks: {
          label: (item: TooltipItem<'bar' | 'line'>) => {
            const value = item.raw as number;
            if (item.datasetIndex === 0) {
              return ` R$ ${value.toFixed(2).replace('.', ',')}`;
            }
            return ` ${value} unidade(s)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: textColor, font: { family: 'Inter, sans-serif' } },
        grid: { color: gridColor },
      },
      x: {
        ticks: { color: textColor, font: { family: 'Inter, sans-serif' } },
        grid: { color: 'transparent' },
      },
    },
  };

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartHeader}>
        {/* 5. O PeriodSelector foi removido daqui */}
        <div className={styles.totals}>
          <p><strong>Total:</strong> R$ {totalSales.toFixed(2).replace('.', ',')}</p>
          <p><strong>Unidades:</strong> {totalUnits}</p>
        </div>
      </div>
      <div className={styles.chartCanvasContainer}>
        <Chart type="bar" data={chartData} options={options as any} />
      </div>
    </div>
  );
};

export default SalesByPeriodChart;
import React, { useEffect, useState } from 'react';
import Chart from '../common/Chart';
import { fetchSalesByProduct, fetchProducts } from '../../services/salesService';
import { TooltipItem } from 'chart.js';

interface ChartStyleProps {
  textColor: string;
  gridColor: string;
  primaryColor: string;
  tooltipBgColor: string;
  // 1. Receber startDate e endDate
  startDate: string;
  endDate: string;
}

const SalesByProductChart: React.FC<ChartStyleProps> = ({ textColor, gridColor, primaryColor, tooltipBgColor, startDate, endDate }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 2. Verificar se as datas existem antes de buscar
    if (startDate && endDate) {
      setLoading(true);
      // 3. Passar as datas para a função do serviço
      Promise.all([fetchProducts(), fetchSalesByProduct(startDate, endDate)]).then(([products, sales]) => {
        const labels = sales.map((item: any) => 
          products.find((p: any) => p.value === item.product)?.label || item.product
        );
        
        setChartData({
          labels,
          datasets: [
            {
              label: 'Vendas por Produto (R$)',
              data: sales.map((item: any) => item.total_sales),
              backgroundColor: `${primaryColor}B3`,
              borderColor: primaryColor,
              borderWidth: 1,
            },
          ],
        });
      }).finally(() => setLoading(false));
    }
  }, [startDate, endDate]);

  if (loading || !chartData) return <div>Carregando...</div>;

  const options = {
    indexAxis: 'y' as const, // Gráfico de barras horizontais para melhor leitura dos nomes
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: textColor,
        bodyColor: textColor,
        titleFont: { size: 16, weight: 'bold', family: 'Inter, sans-serif' },
        bodyFont: { size: 14, family: 'Inter, sans-serif' },
        callbacks: {
          label: (item: TooltipItem<'bar'>) => ` R$ ${(item.raw as number).toFixed(2).replace('.', ',')}`,
        },
      },
    },
    scales: {
      y: {
        ticks: { color: textColor, font: { family: 'Inter, sans-serif' } },
        grid: { color: 'transparent' },
      },
      x: {
        beginAtZero: true,
        ticks: { color: textColor, font: { family: 'Inter, sans-serif' } },
        grid: { color: gridColor },
      },
    },
  };

  return <Chart type="bar" data={chartData} options={options as any} />;
};

export default SalesByProductChart;

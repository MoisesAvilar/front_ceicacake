import React, { useEffect, useState } from 'react';
import Chart from '../common/Chart';
import { fetchSalesByClient } from '../../services/salesService';
import { TooltipItem } from 'chart.js';

interface ChartStyleProps {
  textColor: string;
  tooltipBgColor: string;
  // 1. Receber startDate e endDate
  startDate: string;
  endDate: string;
}

const SalesByClientChart: React.FC<ChartStyleProps> = ({ textColor, tooltipBgColor, startDate, endDate }) => {
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 2. Verificar se as datas existem
    if (startDate && endDate) {
      setLoading(true);
      // 3. Passar as datas para a função do serviço
      fetchSalesByClient(startDate, endDate)
        .then(sales => {
          const labels = sales.map((item: any) => item.customer__name || 'Cliente Desconhecido');
          const data = sales.map((item: any) => item.total_sales);
          const colors = sales.map((_: any, index: number) => `hsl(${200 + index * 35}, 70%, 60%)`);

          setSalesData({
            labels,
            datasets: [{ data, backgroundColor: colors }],
          });
        })
        .finally(() => setLoading(false));
    }
  }, [startDate, endDate]); // 4. Adicionar as datas como dependência


  if (loading || !salesData) return <div>Carregando...</div>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { color: textColor, font: { family: 'Inter, sans-serif' } } },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: textColor,
        bodyColor: textColor,
        titleFont: { size: 16, weight: 'bold', family: 'Inter, sans-serif' },
        bodyFont: { size: 14, family: 'Inter, sans-serif' },
        callbacks: {
          label: (item: TooltipItem<'pie'>) => {
            const value = item.raw as number;
            const total = (item.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return ` R$ ${value.toFixed(2).replace('.', ',')} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Chart type="pie" data={salesData} options={options as any} />;
};

export default SalesByClientChart;
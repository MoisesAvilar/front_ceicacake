import React, { useEffect, useState } from 'react';
import Chart from '../common/Chart';
import { fetchSalesByClient } from '../../services/salesService';
import { fetchCustomers } from '../../services/customersService';
import { TooltipItem } from 'chart.js';

const SalesByClientChart: React.FC = () => {
  const [salesData, setSalesData] = useState<any>(null);
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const getCustomersData = async () => {
      try {
        const customers = await fetchCustomers();
        console.log('Clientes carregados:', customers);
        setCustomersData(customers);
      } catch (error) {
        setError('Erro ao buscar dados de clientes');
      }
    };

    getCustomersData();
  }, []);

  useEffect(() => {

    if (customersData.length === 0) return;
  
    const getSalesData = async () => {
      try {
        const sales = await fetchSalesByClient();
        console.log('Vendas carregadas:', sales);
  

        const updatedSalesData = sales.map((item: any) => ({
          ...item,
          customer_name: item.customer__name || 'Cliente Desconhecido',
        }));
  
        console.log('Dados de vendas atualizados:', updatedSalesData);
  

        const colors = updatedSalesData.map((_, index) => {

          const hue = (index * 360 / updatedSalesData.length) % 360;
          return `hsl(${hue}, 70%, 50%)`;
        });
  
        setSalesData({
          labels: updatedSalesData.map((item: any) => item.customer_name),
          datasets: [
            {
              label: 'Valor comprado',
              data: updatedSalesData.map((item: any) => item.total_sales),
              backgroundColor: colors,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        setError('Erro ao buscar dados de vendas');
      } finally {
        setLoading(false);
      }
    };
  
    getSalesData();
  }, [customersData]);
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 5,
    plugins: {
      title: {
        display: true,
        text: 'Vendas por Cliente',
        font: {
          size: 24,
          weight: 'bold',
          family: 'Arial',
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'pie'>) => {
            const value = tooltipItem.raw;
  

            if (typeof value === 'number') {
              return `R$${value.toFixed(2)}`;
            }
  
            return '';
          },
        },
        titleFont: {
          size: 20,
        },
        bodyFont: {
          size: 18,
        },
      },
    },
  };

  return <Chart type="pie" data={salesData} options={options} />;
};

export default SalesByClientChart;

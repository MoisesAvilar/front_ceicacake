import React, { useEffect, useState } from 'react';
import Chart from '../common/Chart';
import { fetchSalesByProduct } from '../../services/salesService';
import { fetchProducts } from '../../services/salesService';
import { TooltipItem } from 'chart.js';

const SalesByProductChart: React.FC = () => {
  const [salesData, setSalesData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);

  useEffect(() => {

    fetchProducts()
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          setIsProductsLoaded(true);
        } else {
          console.error('Dados de produtos inválidos', data);
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar produtos:', error);
      });
  }, []);

  useEffect(() => {
    if (isProductsLoaded) {

      fetchSalesByProduct()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSalesData({
              labels: data.map((item) => {

                const product = products.find((p) => p.value === item.product);
                return product ? product.label : item.product;
              }),
              datasets: [
                {
                  label: 'Vendas por Produto',
                  data: data.map((item) => item.total_sales),
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
                {
                  label: 'Quantidade Vendida',
                  data: data.map((item) => item.quantity_sold),
                  backgroundColor: 'rgba(255, 159, 64, 0.2)',
                  borderColor: 'rgba(255, 159, 64, 1)',
                  borderWidth: 1,
                  type: 'line',
                },
              ],
            });
          } else {
            console.error('Dados inválidos para vendas por produto', data);
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar dados de vendas:', error);
        });
    }
  }, [isProductsLoaded, products]);

  if (!salesData || !salesData.labels || !salesData.datasets || salesData.datasets.length === 0) {
    return <div>Carregando...</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 5,
    plugins: {
      title: {
        display: true,
        text: 'Vendas por Produto',
        font: {
          size: 24,
          weight: 'bold',
          family: 'Arial',
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'bar' | 'line'>) => {
            const value = tooltipItem.raw;
            if (typeof value === 'number') {
              if (tooltipItem.datasetIndex === 0) {
                return `R$${value.toFixed(2)}`;
              }
              return `${value} unidades`;
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
    scales: {
      y: {
        beginAtZero: true,
        max: 1500,
      },
    },
  };

  return <Chart type="bar" data={salesData} options={options} />;
};

export default SalesByProductChart;

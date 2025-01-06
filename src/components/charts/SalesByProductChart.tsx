import React, { useEffect, useState } from 'react';
import Chart from '../common/Chart';
import { fetchSalesByProduct } from '../../services/salesService';
import { fetchProducts } from '../../services/salesService';
import { TooltipItem } from 'chart.js';

interface SalesData {
  product: string;
  total_sales: number;
  quantity_sold: number;
}

interface Product {
  value: string;
  label: string;
}

const SalesByProductChart: React.FC = () => {
  const [salesData, setSalesData] = useState<{ labels: string[]; datasets: any[] } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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
            const labels = data.map((item: SalesData) => {
              const product = products.find((p) => p.value === item.product);
              return product ? product.label : item.product;
            });

            const backgroundColor = data.map((item: SalesData, index: number) => {
              return index % 2 === 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 159, 64, 0.2)';
            });

            const datasets = [
              {
                label: 'Vendas por Produto',
                data: data.map((item: SalesData) => item.total_sales),
                backgroundColor,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
              {
                label: 'Quantidade Vendida',
                data: data.map((item: SalesData) => item.quantity_sold),
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
                type: 'line',
              },
            ];

            setSalesData({ labels, datasets });
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
            const datasetIndex = tooltipItem.datasetIndex;
            const value = tooltipItem.raw;
            const label = tooltipItem.label;
            if (typeof value === 'number') {
              if (datasetIndex === 0) {
                return `R$${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
              } else if (value === 1) {
                return `${value} unidade`;
              } else {
                return `${value} unidades`; 
              }
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

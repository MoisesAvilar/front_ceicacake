import React, { useEffect, useRef } from 'react';
// O nome do arquivo CSS foi mantido como no seu upload, mas lembre-se que
// na etapa anterior o chamamos de 'common/Chart.module.css'
import styles from './Chart.module.css'; 
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  ChartData,
} from 'chart.js';

// Registro dos componentes do Chart.js (está perfeito)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface ChartProps {
  type: 'line' | 'bar' | 'pie';
  data: ChartData<'line' | 'bar' | 'pie', any[], any>;
  options: any;
}

const Chart: React.FC<ChartProps> = ({ type, data, options }) => {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data]);


  const renderChart = () => {
    if (!data || !data.labels || !data.datasets) {
      return <div>Dados inválidos para o gráfico</div>;
    }

    switch (type) {
      case 'line':
        return <Line ref={chartRef} data={data as ChartData<'line', any[], any>} options={options} />;
      case 'bar':
        return <Bar ref={chartRef} data={data as ChartData<'bar', any[], any>} options={options} />;
      case 'pie':
        return <Pie ref={chartRef} data={data as ChartData<'pie', any[], any>} options={options} />;
      default:
        return <div>Tipo de gráfico desconhecido</div>;
    }
  };

  // Ajuste aqui: trocamos 'chartContainer' por 'chartCanvasContainer'
  // para corresponder ao CSS que criamos.
  return <div className={styles.chartCanvasContainer}>
    {renderChart()}
  </div>;
};

export default Chart;
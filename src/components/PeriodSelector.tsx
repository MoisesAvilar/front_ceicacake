import React, { useState, useEffect } from 'react';
import styles from './PeriodSelector.module.css';

interface PeriodSelectorProps {
  onChange: (startDate: string, endDate: string) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ onChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const today = new Date();
    const firstSaleDate = "2024-03-06";
    const formattedEndDate = formatDate(today);

    setStartDate(firstSaleDate);
    setEndDate(formattedEndDate);

    onChange(firstSaleDate, formattedEndDate);
  }, []);

  const getWeekDates = () => {
    const today = new Date();
    const firstDay = today.getDate() - today.getDay();
    const lastDay = firstDay + 6;
    const startDate = new Date(today.setDate(firstDay));
    const endDate = new Date(today.setDate(lastDay));
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  const getMonthDates = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  const handleQuickSelect = (option: 'today' | 'week' | 'month') => {
    let startDate = '';
    let endDate = '';

    if (option === 'today') {
      const today = new Date();
      startDate = formatDate(today);
      endDate = formatDate(today);
    } else if (option === 'week') {
      const { startDate: weekStart, endDate: weekEnd } = getWeekDates();
      startDate = weekStart;
      endDate = weekEnd;
    } else if (option === 'month') {
      const { startDate: monthStart, endDate: monthEnd } = getMonthDates();
      startDate = monthStart;
      endDate = monthEnd;
    }

    setStartDate(startDate);
    setEndDate(endDate);
    onChange(startDate, endDate);
  };

  const handleSubmit = () => {
    onChange(startDate, endDate);
  };

  return (
    <div className={styles.container}>
      <div className={styles.quickSelect}>
        <button onClick={() => handleQuickSelect('today')} className={styles.quickButton}>
          Hoje
        </button>
        <button onClick={() => handleQuickSelect('week')} className={styles.quickButton}>
          Semana Atual
        </button>
        <button onClick={() => handleQuickSelect('month')} className={styles.quickButton}>
          Mês Atual
        </button>
      </div>

      <div className={styles.dateRange}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={styles.dateInput}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      <button onClick={handleSubmit} className={styles.filterButton}>
        Filtrar
      </button>
    </div>
  );
};

export default PeriodSelector;

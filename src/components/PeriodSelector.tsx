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
    setStartDate(formatDate(today));
    setEndDate(formatDate(today));
  }, []);

  const handleSubmit = () => {
    onChange(startDate, endDate);
  };

  return (
    <div className={styles.container}>
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
      <button onClick={handleSubmit} className={styles.filterButton}>
        Filtrar
      </button>
    </div>
  );
};

export default PeriodSelector;

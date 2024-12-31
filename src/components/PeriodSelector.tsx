import React, { useState } from 'react';
import styles from './PeriodSelector.module.css';
interface PeriodSelectorProps {
  onChange: (startDate: string, endDate: string) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ onChange }) => {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

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

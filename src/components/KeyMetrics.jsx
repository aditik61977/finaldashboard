
import React from 'react';
import styles from './KeyMetrics.module.css';

const KeyMetrics = ({ metrics = [] }) => {
  
  console.log('KeyMetrics - metrics:', metrics);

  
  const safeMetrics = Array.isArray(metrics) ? metrics : [];

  
  const displayMetrics = safeMetrics.length > 0 ? safeMetrics : [
    { label: 'Total Students', value: '0' },
    { label: 'Placement Rate', value: '0%' },
    { label: 'Average Package', value: '₹0' },
    { label: 'Total Companies', value: '0' }
  ];

  return (
    <div className={styles.container}>
      {displayMetrics.map(({ label, value }) => (
        <div key={label} className={styles.card}>
          <div className={styles.value}>{value || '0'}</div>
          <div className={styles.label}>{label || 'Unknown'}</div>
        </div>
      ))}
    </div>
  );
};

export default KeyMetrics;

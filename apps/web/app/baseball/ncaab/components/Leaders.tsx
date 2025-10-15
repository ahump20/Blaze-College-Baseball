'use client';

import styles from './Leaders.module.css';

interface LeaderItem {
  label: string;
  value: string;
  subvalue?: string;
}

export interface LeadersProps {
  items: LeaderItem[];
}

export function Leaders({ items }: LeadersProps) {
  return (
    <div className={styles.grid} role="list">
      {items.map((item) => (
        <article key={item.label} className={styles.card} role="listitem">
          <p className={styles.label}>{item.label}</p>
          <p className={styles.value}>{item.value}</p>
          {item.subvalue ? <p className={styles.subvalue}>{item.subvalue}</p> : null}
        </article>
      ))}
    </div>
  );
}

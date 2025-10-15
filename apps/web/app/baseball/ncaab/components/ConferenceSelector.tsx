'use client';

import { ChangeEvent, useId } from 'react';
import styles from './ui.module.css';

export interface ConferenceOption {
  value: string;
  label: string;
  description?: string;
}

interface ConferenceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: ConferenceOption[];
}

export function ConferenceSelector({ value, onChange, options }: ConferenceSelectorProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  const activeOption = options.find((option) => option.value === value);
  const fieldId = useId();
  const descriptionId = activeOption?.description ? `${fieldId}-description` : undefined;

  return (
    <div className={styles.selector}>
      <label className={styles.selectorLabel} htmlFor={`${fieldId}-select`}>
        Conference
      </label>
      <div className={styles.selectWrapper}>
        <select
          id={`${fieldId}-select`}
          className={styles.select}
          value={value}
          onChange={handleChange}
          aria-label="Select college baseball conference"
          aria-describedby={descriptionId}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {activeOption?.description && (
        <p className={styles.selectorDescription} id={descriptionId}>
          {activeOption.description}
        </p>
      )}
    </div>
  );
}

export default ConferenceSelector;

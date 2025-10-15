'use client';

import type { ReactNode } from 'react';
import { Card } from './Card';
import styles from './PageState.module.css';

export type PageStateKind = 'loading' | 'empty' | 'error';

export interface PageStateProps {
  title: string;
  description: ReactNode;
  state: PageStateKind;
  isMobile: boolean;
  role?: 'alert';
}

export function PageState({ title, description, state, isMobile, role }: PageStateProps) {
  return (
    <Card className={styles.card} data-state={state} data-view={isMobile ? 'mobile' : 'desktop'} role={role}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{description}</div>
    </Card>
  );
}

'use client';

import { useIsMobile } from './use-breakpoint';
import styles from './ui.module.css';

type DataStateType = 'loading' | 'empty' | 'error';

interface DataStateMessageProps {
  state: DataStateType;
  heading: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  asListItem?: boolean;
}

export function DataStateMessage({ state, heading, description, actionLabel, onAction, asListItem = true }: DataStateMessageProps) {
  const isMobile = useIsMobile();
  const isLoading = state === 'loading';
  const role = isLoading ? 'status' : 'alert';
  const ariaLabel = `${heading} ${isLoading ? 'loading' : 'notice'}`;

  return (
    <article
      className={`${styles.card} ${styles.dataState}`}
      role={asListItem ? 'listitem' : undefined}
      data-breakpoint={isMobile ? 'mobile' : 'desktop'}
    >
      <div role={role} aria-live={isLoading ? 'polite' : 'assertive'} aria-label={ariaLabel}>
        <h2 className={styles.dataStateTitle}>{heading}</h2>
        <p className={styles.dataStateDescription}>{description}</p>
        {onAction && (
          <button
            type="button"
            className={styles.retryButton}
            onClick={onAction}
            aria-label={actionLabel ?? 'Retry request'}
          >
            {actionLabel ?? 'Retry'}
          </button>
        )}
      </div>
    </article>
  );
}

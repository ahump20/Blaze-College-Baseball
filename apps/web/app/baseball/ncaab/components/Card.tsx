'use client';

import { ComponentPropsWithoutRef, ElementType, forwardRef } from 'react';
import styles from './Card.module.css';

type CardElement = ElementType;

const cx = (...values: (string | false | undefined)[]) => values.filter(Boolean).join(' ');

export interface CardProps<T extends CardElement = 'article'> extends ComponentPropsWithoutRef<T> {
  as?: T;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as, className, ...props },
  ref
) {
  const Component = (as ?? 'article') as CardElement;
  return <Component ref={ref as never} className={cx(styles.card, className)} {...props} />;
});

export interface CardHeaderProps extends ComponentPropsWithoutRef<'div'> {}

export const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={cx(styles.header, className)} {...props} />
);

export const CardTitle = ({ className, ...props }: ComponentPropsWithoutRef<'h2'>) => (
  <h2 className={cx(styles.title, className)} {...props} />
);

export const CardMuted = ({ className, ...props }: ComponentPropsWithoutRef<'p'>) => (
  <p className={cx(styles.muted, className)} {...props} />
);

export const CardBadge = ({ className, ...props }: ComponentPropsWithoutRef<'span'>) => (
  <span className={cx(styles.badge, className)} {...props} />
);

export const CardActions = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={cx(styles.actions, className)} {...props} />
);

export const CardLink = ({ className, ...props }: ComponentPropsWithoutRef<'a'>) => (
  <a className={cx(styles.link, className)} {...props} />
);

export const CardGrid = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={cx(styles.grid, className)} {...props} />
);

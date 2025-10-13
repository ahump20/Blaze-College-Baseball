import type { ReactNode } from 'react';

const cx = (...values: Array<string | false | null | undefined>): string => values.filter(Boolean).join(' ');

export interface PaywallCalloutProps {
  title: string;
  description: string;
  benefits: Array<string | ReactNode>;
  ctaLabel: string;
  ctaHref: string;
  badgeLabel?: string;
  className?: string;
}

export function PaywallCallout({
  title,
  description,
  benefits,
  ctaLabel,
  ctaHref,
  badgeLabel = 'Diamond Pro',
  className
}: PaywallCalloutProps) {
  return (
    <div
      className={cx(
        'flex flex-col gap-sm rounded-2xl border border-accent-gold/40 bg-background-surface px-lg py-lg shadow-surface',
        className
      )}
    >
      <span className="self-start rounded-pill border border-accent-gold/60 bg-accent-gold/10 px-sm py-2xs text-xs font-semibold uppercase tracking-[0.3em] text-accent-gold">
        {badgeLabel}
      </span>
      <div className="space-y-2xs">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-foreground-muted">{description}</p>
      </div>
      <ul className="space-y-2xs text-sm text-foreground">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2xs">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-gold" aria-hidden />
            <span className="text-foreground-muted">{benefit}</span>
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className="inline-flex items-center justify-center gap-2xs rounded-pill bg-accent-gold px-md py-xs text-sm font-semibold text-background transition hover:bg-accent-crimson focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        rel="noopener noreferrer"
      >
        {ctaLabel}
      </a>
    </div>
  );
}

export type { PaywallCalloutProps as PaywallCalloutProperties };

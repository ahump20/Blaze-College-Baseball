'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useSubscription } from './subscription-context';

type ProFeatureProps = {
  title: string;
  description: string;
  upgradeCta?: string;
  href?: string;
  children: ReactNode;
};

export function ProFeature({ title, description, upgradeCta = 'Unlock with Diamond Pro', href = '/diamond-pro', children }: ProFeatureProps) {
  const { isPro } = useSubscription();

  return (
    <article className="di-card">
      <header className="di-card-header">
        <div>
          <h2>{title}</h2>
          <p className="di-text-muted">{description}</p>
        </div>
        {!isPro && <span className="di-pill">Pro</span>}
      </header>
      <div className="di-card-body">
        {isPro ? (
          children
        ) : (
          <div className="di-locked">
            <p>Sign up for Diamond Pro to access this premium module.</p>
            <Link className="di-inline-link" href={href}>
              {upgradeCta}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

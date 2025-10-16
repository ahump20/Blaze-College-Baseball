'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="di-page">
      <section className="di-section di-auth">
        <span className="di-kicker">Diamond Insights · Auth</span>
        <h1 className="di-page-title">Sign In</h1>
        <p className="di-page-subtitle">
          Authenticate with Clerk to sync your Diamond Pro subscription, alert preferences, and personalized dashboards.
        </p>
        <div className="di-card-grid">
          <article className="di-card">
            <h2>Access Diamond Insights</h2>
            <SignIn appearance={{ elements: { card: 'di-card' } }} routing="hash" redirectUrl="/baseball/ncaab/dashboard" />
          </article>
          <article className="di-card">
            <h2>Need an Account?</h2>
            <p>Choose an action below.</p>
            <ul className="di-list">
              <li>
                <Link className="di-inline-link" href="/auth/sign-up">
                  Create a Diamond Insights account
                </Link>
              </li>
              <li>
                <Link className="di-inline-link" href="/diamond-pro">
                  Explore Diamond Pro benefits
                </Link>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}

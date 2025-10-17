'use client';

import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="di-page">
      <section className="di-section di-auth">
        <span className="di-kicker">Diamond Insights · Auth</span>
        <h1 className="di-page-title">Create Account</h1>
        <p className="di-page-subtitle">
          Launch your personalized college baseball feed, configure alerts, and unlock Diamond Pro once you complete sign-up.
        </p>
        <div className="di-card-grid">
          <article className="di-card">
            <h2>Register</h2>
            <SignUp appearance={{ elements: { card: 'di-card' } }} routing="hash" afterSignUpUrl="/baseball/ncaab/dashboard" />
          </article>
          <article className="di-card">
            <h2>Already have an account?</h2>
            <p>Jump back to the sign-in flow.</p>
            <ul className="di-list">
              <li>
                <Link className="di-inline-link" href="/auth/sign-in">
                  Sign in to Diamond Insights
                </Link>
              </li>
              <li>
                <Link className="di-inline-link" href="/diamond-pro">
                  View Diamond Pro roadmap
                </Link>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}

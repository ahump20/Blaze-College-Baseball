import type { Metadata } from 'next';

const effectiveDate = 'September 28, 2025';

export const metadata: Metadata = {
  title: 'Cookie Policy — Blaze Sports Intel',
  description: 'Understand how Blaze Sports Intel uses essential, analytics, and functionality cookies and how to manage preferences.'
};

export default function CookiePolicyPage() {
  return (
    <main className="legal-content" id="cookie-policy">
      <h1>Cookie Policy</h1>
      <p>
        <strong>Effective Date:</strong> {effectiveDate}
      </p>
      <p>
        <strong>Last Updated:</strong> {effectiveDate}
      </p>

      <section>
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your device when you visit our website. They help us provide better service,
          remember preferences, and analyze usage.
        </p>
      </section>

      <section>
        <h2>2. Types of Cookies We Use</h2>
        <h3>2.1 Essential Cookies (Always Active)</h3>
        <p>
          <strong>Purpose:</strong> Required for basic site functionality
        </p>
        <p>
          <strong>Examples:</strong>
        </p>
        <ul>
          <li>session_id: Maintains your session</li>
          <li>security_token: CSRF protection</li>
          <li>user_preferences: Language, timezone settings</li>
        </ul>
        <p>
          <strong>Retention:</strong> Session or up to 1 year
        </p>

        <h3>2.2 Analytics Cookies (Consent Required)</h3>
        <p>
          <strong>Purpose:</strong> Understand site usage and improve services
        </p>
        <p>
          <strong>Examples:</strong>
        </p>
        <ul>
          <li>_ga (Google Analytics): User tracking</li>
          <li>_gid (Google Analytics): Session tracking</li>
          <li>cf_analytics (Cloudflare): Performance metrics</li>
        </ul>
        <p>
          <strong>Retention:</strong> Up to 2 years
        </p>

        <h3>2.3 Functionality Cookies (Consent Required)</h3>
        <p>
          <strong>Purpose:</strong> Enhanced features and personalization
        </p>
        <p>
          <strong>Examples:</strong>
        </p>
        <ul>
          <li>team_preferences: Favorite teams</li>
          <li>display_settings: Dashboard configuration</li>
          <li>notification_prefs: Alert settings</li>
        </ul>
        <p>
          <strong>Retention:</strong> Up to 1 year
        </p>

        <h3>2.4 Third-Party Cookies</h3>
        <p>
          <strong>Sports Data Providers:</strong>
        </p>
        <ul>
          <li>Authentication tokens for API access</li>
          <li>Rate limiting identifiers</li>
        </ul>
      </section>

      <section>
        <h2>3. Legal Basis</h2>
        <p>
          <strong>GDPR (EU Users):</strong>
        </p>
        <ul>
          <li>Essential cookies: Legitimate interest</li>
          <li>Other cookies: Explicit consent</li>
        </ul>
        <p>
          <strong>CCPA (California Users):</strong>
        </p>
        <ul>
          <li>Right to opt-out of sale (we do not sell)</li>
          <li>Disclosure of data collection practices</li>
        </ul>
      </section>

      <section id="settings">
        <h2>4. Managing Cookies</h2>
        <h3>4.1 Cookie Consent Tool</h3>
        <p>Use our cookie preference center to:</p>
        <ul>
          <li>Accept or reject cookie categories</li>
          <li>Withdraw consent anytime</li>
          <li>View detailed cookie information</li>
        </ul>
        <h3>4.2 Browser Controls</h3>
        <ul>
          <li>Chrome: Settings &gt; Privacy &gt; Cookies</li>
          <li>Firefox: Settings &gt; Privacy &amp; Security</li>
          <li>Safari: Preferences &gt; Privacy</li>
          <li>Edge: Settings &gt; Privacy &gt; Cookies</li>
        </ul>
        <h3>4.3 Opt-Out Links</h3>
        <ul>
          <li>
            Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout">https://tools.google.com/dlpage/gaoptout</a>
          </li>
          <li>Cloudflare: Via our preference center</li>
        </ul>
      </section>

      <section>
        <h2>5. Impact of Disabling Cookies</h2>
        <ul>
          <li>Essential Cookies: Site may not function properly</li>
          <li>Analytics: We cannot improve services based on usage</li>
          <li>Functionality: Limited personalization features</li>
        </ul>
      </section>

      <section>
        <h2>6. Do Not Track</h2>
        <p>We respect Do Not Track browser signals and will not set non-essential cookies when detected.</p>
      </section>

      <section>
        <h2>7. Updates to This Policy</h2>
        <p>Changes will be posted with effective date. Material changes notified via website banner.</p>
      </section>

      <section>
        <h2>8. Contact Us</h2>
        <p>
          Cookie questions: privacy@blazesportsintel.com
          <br />
          Data Protection Officer: dpo@blazesportsintel.com
        </p>
      </section>
    </main>
  );
}

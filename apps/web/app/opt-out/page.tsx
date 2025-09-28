import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opt-Out Preferences — Blaze Sports Intel',
  description: 'Manage marketing communications and analytics consent preferences with Blaze Sports Intel.'
};

export default function OptOutPage() {
  return (
    <main className="legal-content" id="opt-out">
      <h1>Opt-Out Preferences</h1>
      <section>
        <h2>Email Marketing</h2>
        <p>
          Click the unsubscribe link in any marketing email or contact privacy@blazesportsintel.com with the subject “Unsubscribe.”
          Requests are processed within 48 hours.
        </p>
      </section>
      <section>
        <h2>Analytics Cookies</h2>
        <p>
          Update your cookie preferences via our on-site banner or visit the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out page</a>.
        </p>
      </section>
      <section>
        <h2>Third-Party Data Sharing</h2>
        <p>
          Blaze Sports Intel does not sell personal information. For inquiries about data sharing with service providers, contact
          privacy@blazesportsintel.com.
        </p>
      </section>
    </main>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility — Blaze Sports Intel',
  description: 'Learn about Blaze Sports Intel’s accessibility commitments, WCAG AA targets, and how to request assistance.'
};

export default function AccessibilityPage() {
  return (
    <main className="legal-content" id="accessibility">
      <h1>Accessibility Statement</h1>
      <section>
        <h2>Commitment</h2>
        <p>
          Blaze Sports Intel is committed to providing a website that is accessible to the widest possible audience, regardless of
          technology or ability. We aim to conform to WCAG 2.1 AA guidelines and continuously improve usability.
        </p>
      </section>
      <section>
        <h2>Measures We Take</h2>
        <ul>
          <li>Semantic HTML with keyboard-accessible navigation</li>
          <li>High-contrast color palette with focus indicators</li>
          <li>Support for screen readers and alternative text on imagery</li>
          <li>Regular accessibility audits and issue remediation</li>
        </ul>
      </section>
      <section>
        <h2>Request Assistance</h2>
        <p>
          If you experience difficulty accessing any part of our site, please contact accessibility@blazesportsintel.com. Provide a
          description of the issue and your contact details so we can assist promptly.
        </p>
      </section>
    </main>
  );
}

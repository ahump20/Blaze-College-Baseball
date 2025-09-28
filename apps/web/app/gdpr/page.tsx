import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GDPR Rights — Blaze Sports Intel',
  description: 'Guidance for EU users on exercising their GDPR data protection rights with Blaze Sports Intel.'
};

export default function GdprRightsPage() {
  return (
    <main className="legal-content" id="gdpr-rights">
      <h1>GDPR Rights (EU Users)</h1>
      <p>If you are located in the European Union, you have the following rights under the GDPR:</p>
      <ul>
        <li>
          <strong>Access:</strong> Request a copy of personal data we hold about you.
        </li>
        <li>
          <strong>Rectification:</strong> Correct inaccurate or incomplete data.
        </li>
        <li>
          <strong>Erasure:</strong> Request deletion of personal data when no longer necessary or consent is withdrawn.
        </li>
        <li>
          <strong>Portability:</strong> Receive data in a structured, commonly used format.
        </li>
        <li>
          <strong>Restriction:</strong> Ask us to limit processing of your data in certain circumstances.
        </li>
        <li>
          <strong>Objection:</strong> Object to processing based on legitimate interests or direct marketing.
        </li>
        <li>
          <strong>Automated Decision-Making:</strong> Request human review of automated decisions.
        </li>
      </ul>
      <p>
        Submit GDPR requests to privacy@blazesportsintel.com. We will respond within 30 days and may request verification to protect your account.
      </p>
    </main>
  );
}

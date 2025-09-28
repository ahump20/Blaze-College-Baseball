import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Request — Blaze Sports Intel',
  description: 'Instructions for requesting access to personal data held by Blaze Sports Intel.'
};

export default function DataRequestPage() {
  return (
    <main className="legal-content" id="data-request">
      <h1>Request Your Data</h1>
      <p>
        To request a copy of your personal data, please email privacy@blazesportsintel.com with the subject line “Data Access
        Request.” Include the following information so we can verify your identity:
      </p>
      <ul>
        <li>Full name associated with your Blaze Sports Intel account</li>
        <li>Registered email address</li>
        <li>Contact phone number (optional)</li>
        <li>Summary of the data you are requesting</li>
      </ul>
      <p>
        We will acknowledge your request within 7 days and deliver the data within applicable legal timeframes (30 days for GDPR,
        45 days for CCPA). Requests may require additional verification.
      </p>
    </main>
  );
}

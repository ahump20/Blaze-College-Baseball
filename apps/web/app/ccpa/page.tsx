import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CCPA Rights — Blaze Sports Intel',
  description: 'Information for California residents on their CCPA privacy rights and how to exercise them with Blaze Sports Intel.'
};

export default function CcpaRightsPage() {
  return (
    <main className="legal-content" id="ccpa-rights">
      <h1>CCPA Rights (California Users)</h1>
      <p>California residents have the following rights under the California Consumer Privacy Act (CCPA):</p>
      <ul>
        <li>
          <strong>Know:</strong> Request disclosure of the categories and specific pieces of personal information collected, used, or shared.
        </li>
        <li>
          <strong>Delete:</strong> Ask us to delete personal information collected from you, subject to legal exceptions.
        </li>
        <li>
          <strong>Opt-Out:</strong> Decline the sale of personal information (Blaze Sports Intel does not sell personal data).
        </li>
        <li>
          <strong>Non-Discrimination:</strong> Receive equal service and price even if you exercise privacy rights.
        </li>
      </ul>
      <p>
        Submit CCPA requests to privacy@blazesportsintel.com or call the number provided in your account agreement. We will respond within 45 days and may require verification before processing requests.
      </p>
    </main>
  );
}

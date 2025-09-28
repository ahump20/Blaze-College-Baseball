import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delete Account — Blaze Sports Intel',
  description: 'Steps to request deletion of your Blaze Sports Intel account and associated data.'
};

export default function DeleteAccountPage() {
  return (
    <main className="legal-content" id="delete-account">
      <h1>Delete Your Account</h1>
      <p>
        You may request deletion of your Blaze Sports Intel account at any time. Send an email to privacy@blazesportsintel.com with
        the subject line “Account Deletion Request.” Include:
      </p>
      <ul>
        <li>Your full name and account email address</li>
        <li>Confirmation that you want all associated data removed</li>
        <li>Any active subscriptions or integrations that should be cancelled</li>
      </ul>
      <p>
        We will confirm your request within 7 days and complete deletion within 30 days, subject to legal retention obligations. Once
        deletion is processed, access to your account and historical analytics will be permanently removed.
      </p>
    </main>
  );
}

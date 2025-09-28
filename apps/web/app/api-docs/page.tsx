import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation — Blaze Sports Intel',
  description: 'Overview of Blaze Sports Intel API endpoints, authentication, and rate limits.'
};

export default function ApiDocsPage() {
  return (
    <main className="legal-content" id="api-docs">
      <h1>API Documentation Overview</h1>
      <p>
        Complete API documentation will be available at launch. The Blaze Sports Intel API will offer authenticated REST endpoints
        for ingesting 3D pose data, retrieving biomechanical analytics, accessing power rankings, and generating clips.
      </p>
      <section>
        <h2>Planned Access Model</h2>
        <ul>
          <li>Authentication via JWT with refresh tokens</li>
          <li>Standard rate limit: 1,000 requests per hour</li>
          <li>Premium rate limit: 10,000 requests per hour</li>
          <li>Webhooks for key mechanical alerts</li>
        </ul>
      </section>
      <section>
        <h2>Developer Support</h2>
        <p>Email api@blazesportsintel.com to join the waitlist or ask integration questions.</p>
      </section>
    </main>
  );
}

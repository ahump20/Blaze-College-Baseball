import type { Metadata } from 'next';

const effectiveDate = 'September 28, 2025';

export const metadata: Metadata = {
  title: 'Privacy Policy — Blaze Sports Intel',
  description:
    'Learn how Blaze Sports Intel collects, uses, and protects personal data in compliance with GDPR, CCPA, and other privacy regulations.'
};

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-content" id="privacy-policy">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Effective Date:</strong> {effectiveDate}
      </p>
      <p>
        <strong>Last Updated:</strong> {effectiveDate}
      </p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Blaze Sports Intel ("BSI," "we," "our," or "us") operates the website blazesportsintel.com (the "Service"). This Privacy
          Policy governs the collection, use, and disclosure of information when you use our Service in compliance with the General
          Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable privacy laws.
        </p>
        <p>
          <strong>Contact Information:</strong>
        </p>
        <ul>
          <li>Email: privacy@blazesportsintel.com</li>
          <li>Data Protection Officer: dpo@blazesportsintel.com</li>
        </ul>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <h3>2.1 Information You Provide</h3>
        <ul>
          <li>
            <strong>Account Data:</strong> Email address, username, password (encrypted)
          </li>
          <li>
            <strong>Profile Information:</strong> Sports preferences, favorite teams, notification settings
          </li>
          <li>
            <strong>Communications:</strong> Support tickets, feedback, survey responses
          </li>
        </ul>
        <h3>2.2 Automatically Collected Information</h3>
        <ul>
          <li>
            <strong>Usage Data:</strong> Pages viewed, features used, time spent, click patterns
          </li>
          <li>
            <strong>Device Information:</strong> IP address, browser type, operating system, device identifiers
          </li>
          <li>
            <strong>Location Data:</strong> General geographic location based on IP address
          </li>
          <li>
            <strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies (see Cookie Policy)
          </li>
        </ul>
        <h3>2.3 Sports Data Services</h3>
        <ul>
          <li>
            <strong>API Interactions:</strong> Queries made to sports data providers
          </li>
          <li>
            <strong>Saved Preferences:</strong> Teams followed, leagues monitored, custom alerts
          </li>
          <li>
            <strong>Historical Searches:</strong> Past queries for personalization (retained 90 days)
          </li>
        </ul>
        <h3>2.4 Information We Do Not Collect</h3>
        <ul>
          <li>Payment information (processed by third-party providers)</li>
          <li>Biometric data</li>
          <li>Government identification numbers</li>
          <li>Health or medical information</li>
        </ul>
      </section>

      <section>
        <h2>3. Legal Basis for Processing</h2>
        <p>
          We process your information under the following legal bases:
        </p>
        <p>
          <strong>GDPR (European Users):</strong>
        </p>
        <ul>
          <li>
            <strong>Consent:</strong> For marketing communications and cookies
          </li>
          <li>
            <strong>Legitimate Interests:</strong> Service improvement, fraud prevention, analytics
          </li>
          <li>
            <strong>Contract Performance:</strong> To provide requested services
          </li>
          <li>
            <strong>Legal Obligation:</strong> Compliance with applicable laws
          </li>
        </ul>
        <p>
          <strong>CCPA (California Users):</strong>
        </p>
        <ul>
          <li>With your consent or as permitted under California law</li>
          <li>To fulfill the business purpose for which you provided the information</li>
          <li>For compliance with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>4. How We Use Your Information</h2>
        <h3>4.1 Primary Uses</h3>
        <ul>
          <li>Provide sports data, scores, and analytics services</li>
          <li>Personalize content based on your preferences</li>
          <li>Send service updates and notifications</li>
          <li>Respond to support requests</li>
          <li>Improve Service functionality and user experience</li>
        </ul>
        <h3>4.2 Analytics and Performance</h3>
        <ul>
          <li>Monitor Service performance and uptime</li>
          <li>Analyze usage patterns to improve features</li>
          <li>Conduct A/B testing for optimization</li>
          <li>Generate aggregated, non-identifiable statistics</li>
        </ul>
        <h3>4.3 Legal and Safety</h3>
        <ul>
          <li>Comply with legal obligations</li>
          <li>Enforce Terms of Service</li>
          <li>Prevent fraud and abuse</li>
          <li>Protect rights and safety of users</li>
        </ul>
      </section>

      <section>
        <h2>5. Data Sharing and Disclosure</h2>
        <h3>5.1 Service Providers</h3>
        <p>We share data with carefully selected providers:</p>
        <ul>
          <li>
            <strong>Cloudflare:</strong> Content delivery, DDoS protection, analytics
          </li>
          <li>
            <strong>Sports Data Providers:</strong> MLB Stats API, NCAA, licensed data sources
          </li>
          <li>
            <strong>Analytics:</strong> Google Analytics (anonymized)
          </li>
        </ul>
        <h3>5.2 Legal Requirements</h3>
        <p>We may disclose information when required by:</p>
        <ul>
          <li>Court orders or subpoenas</li>
          <li>Government requests</li>
          <li>Legal proceedings</li>
          <li>Protection of our rights or safety</li>
        </ul>
        <h3>5.3 Business Transfers</h3>
        <p>In case of merger, acquisition, or sale, user information may be transferred with appropriate notice.</p>
        <h3>5.4 No Sale of Personal Information</h3>
        <p>We do not sell, rent, or trade your personal information to third parties.</p>
      </section>

      <section>
        <h2>6. Data Retention</h2>
        <table>
          <thead>
            <tr>
              <th>Data Category</th>
              <th>Retention Period</th>
              <th>Justification</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account Data</td>
              <td>Duration of account + 30 days</td>
              <td>Service provision</td>
            </tr>
            <tr>
              <td>Usage Logs</td>
              <td>90 days</td>
              <td>Performance monitoring</td>
            </tr>
            <tr>
              <td>Marketing Preferences</td>
              <td>Until withdrawn</td>
              <td>Consent-based</td>
            </tr>
            <tr>
              <td>Legal Records</td>
              <td>7 years</td>
              <td>Legal requirements</td>
            </tr>
            <tr>
              <td>Cookies</td>
              <td>See Cookie Policy</td>
              <td>Various</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>7. Your Rights</h2>
        <h3>7.1 GDPR Rights (EU Users)</h3>
        <ul>
          <li>
            <strong>Access:</strong> Request copy of your data
          </li>
          <li>
            <strong>Rectification:</strong> Correct inaccurate data
          </li>
          <li>
            <strong>Erasure:</strong> "Right to be forgotten"
          </li>
          <li>
            <strong>Portability:</strong> Receive data in portable format
          </li>
          <li>
            <strong>Restriction:</strong> Limit processing
          </li>
          <li>
            <strong>Objection:</strong> Opt-out of certain processing
          </li>
          <li>
            <strong>Automated Decision-Making:</strong> Right to human review
          </li>
        </ul>
        <h3>7.2 CCPA Rights (California Users)</h3>
        <ul>
          <li>
            <strong>Know:</strong> What personal information is collected, used, shared
          </li>
          <li>
            <strong>Delete:</strong> Request deletion of personal information
          </li>
          <li>
            <strong>Opt-Out:</strong> Decline sale of personal information (we do not sell)
          </li>
          <li>
            <strong>Non-Discrimination:</strong> Equal service regardless of privacy choices
          </li>
        </ul>
        <h3>7.3 Exercising Your Rights</h3>
        <p>Submit requests to: privacy@blazesportsintel.com</p>
        <p>Response time: Within 30 days (GDPR) or 45 days (CCPA). Verification required for security.</p>
      </section>

      <section>
        <h2>8. Data Security</h2>
        <h3>8.1 Technical Measures</h3>
        <ul>
          <li>TLS 1.3 encryption for data transmission</li>
          <li>Encrypted data storage</li>
          <li>Regular security audits</li>
          <li>Penetration testing</li>
          <li>DDoS protection via Cloudflare</li>
        </ul>
        <h3>8.2 Organizational Measures</h3>
        <ul>
          <li>Limited access on need-to-know basis</li>
          <li>Employee confidentiality agreements</li>
          <li>Regular security training</li>
          <li>Incident response procedures</li>
        </ul>
        <h3>8.3 Breach Notification</h3>
        <ul>
          <li>Notification within 72 hours (GDPR requirement)</li>
          <li>Direct communication if high risk</li>
          <li>Regulatory authority notification as required</li>
        </ul>
      </section>

      <section>
        <h2>9. International Transfers</h2>
        <p>
          Data may be transferred to and processed in the United States. We ensure adequate protection through Standard
          Contractual Clauses and other safeguards consistent with GDPR Article 46.
        </p>
      </section>

      <section>
        <h2>10. Children's Privacy</h2>
        <p>
          Our Service is not directed to children under 13. We do not knowingly collect personal information from children under
          13. If discovered, such information will be immediately deleted.
        </p>
      </section>

      <section>
        <h2>11. Cookies and Tracking</h2>
        <h3>11.1 Essential Cookies</h3>
        <p>Required for Service functionality:</p>
        <ul>
          <li>Session management</li>
          <li>Security tokens</li>
          <li>User preferences</li>
        </ul>
        <h3>11.2 Analytics Cookies</h3>
        <p>With your consent:</p>
        <ul>
          <li>Google Analytics (anonymized)</li>
          <li>Cloudflare Analytics</li>
          <li>Performance monitoring</li>
        </ul>
        <h3>11.3 Managing Cookies</h3>
        <ul>
          <li>Browser settings</li>
          <li>Cookie preference center on our site</li>
          <li>Opt-out tools: https://tools.google.com/dlpage/gaoptout</li>
        </ul>
      </section>

      <section>
        <h2>12. Third-Party Links</h2>
        <p>
          Our Service may contain links to third-party sites. We are not responsible for their privacy practices. Review their
          policies before providing information.
        </p>
      </section>

      <section>
        <h2>13. Changes to This Policy</h2>
        <p>
          We will notify you of material changes via email notification, prominent website notice, and 30-day advance notice for
          material changes.
        </p>
      </section>

      <section>
        <h2>14. Complaints</h2>
        <p>
          EU Users: Contact our DPO first, then your local supervisory authority if unsatisfied.
          <br />
          California Users: California Attorney General — https://oag.ca.gov/privacy
        </p>
      </section>

      <section>
        <h2>15. Accessibility</h2>
        <p>This policy is available in accessible formats upon request.</p>
      </section>
    </main>
  );
}

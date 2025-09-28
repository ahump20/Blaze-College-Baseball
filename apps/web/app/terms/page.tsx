import type { Metadata } from 'next';

const effectiveDate = 'September 28, 2025';

export const metadata: Metadata = {
  title: 'Terms of Service — Blaze Sports Intel',
  description: 'Review the Terms of Service governing access and use of the Blaze Sports Intel platform and APIs.'
};

export default function TermsOfServicePage() {
  return (
    <main className="legal-content" id="terms-of-service">
      <h1>Terms of Service</h1>
      <p>
        <strong>Effective Date:</strong> {effectiveDate}
      </p>
      <p>
        <strong>Last Updated:</strong> {effectiveDate}
      </p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Blaze Sports Intel ("Service"), operated by Blaze Sports Intel ("Company," "we," "our," "us"), you
          ("User," "you," "your") agree to these Terms of Service ("Terms"). If you disagree, do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Service Description</h2>
        <h3>2.1 What We Provide</h3>
        <ul>
          <li>Real-time scores and statistics</li>
          <li>Historical sports data</li>
          <li>Power rankings and analytics</li>
          <li>API integration services</li>
          <li>Custom data visualizations</li>
        </ul>
        <h3>2.2 Eligibility</h3>
        <ul>
          <li>You must be at least 13 years old</li>
          <li>If under 18, parental consent required</li>
          <li>Not prohibited from using the Service under applicable law</li>
        </ul>
      </section>

      <section>
        <h2>3. Account Responsibilities</h2>
        <h3>3.1 Registration</h3>
        <ul>
          <li>Provide accurate, current information</li>
          <li>Maintain security of credentials</li>
          <li>Notify us of unauthorized access</li>
          <li>Responsible for all account activity</li>
        </ul>
        <h3>3.2 Prohibited Activities</h3>
        <p>You agree NOT to:</p>
        <ul>
          <li>Violate any laws or regulations</li>
          <li>Infringe intellectual property rights</li>
          <li>Scrape data without authorization</li>
          <li>Circumvent rate limits or access controls</li>
          <li>Distribute malware or harmful code</li>
          <li>Impersonate others</li>
          <li>Use for gambling where prohibited</li>
          <li>Resell or sublicense without permission</li>
        </ul>
      </section>

      <section>
        <h2>4. Sports Data and Content</h2>
        <h3>4.1 Data Sources</h3>
        <p>
          Sports data provided through licensed agreements with official league statistics providers, authorized data aggregators,
          and public domain sources.
        </p>
        <h3>4.2 Accuracy Disclaimer</h3>
        <ul>
          <li>Data provided "as-is" without warranty</li>
          <li>Not responsible for third-party data errors</li>
          <li>Updates subject to source availability</li>
          <li>Live scores may have delays</li>
        </ul>
        <h3>4.3 Intellectual Property</h3>
        <ul>
          <li>All content © 2025 Blaze Sports Intel unless noted</li>
          <li>Team names and logos belong to respective owners</li>
          <li>User-generated content remains yours with license to us</li>
          <li>No unauthorized commercial use</li>
        </ul>
      </section>

      <section>
        <h2>5. API Usage Terms</h2>
        <h3>5.1 Rate Limits</h3>
        <ul>
          <li>1,000 requests per hour (standard tier)</li>
          <li>10,000 requests per hour (premium tier)</li>
          <li>Automatic throttling for exceeded limits</li>
          <li>Exponential backoff required</li>
        </ul>
        <h3>5.2 Acceptable Use</h3>
        <ul>
          <li>Personal or internal business use</li>
          <li>Attribution required: "Data from Blaze Sports Intel"</li>
          <li>No high-frequency trading applications</li>
          <li>Comply with data provider restrictions</li>
        </ul>
      </section>

      <section>
        <h2>6. Payment Terms (When Applicable)</h2>
        <h3>6.1 Subscription Services</h3>
        <ul>
          <li>Monthly/annual billing cycles</li>
          <li>Automatic renewal unless cancelled</li>
          <li>Pro-rata refunds at our discretion</li>
          <li>Price changes with 30-day notice</li>
        </ul>
        <h3>6.2 Refund Policy</h3>
        <ul>
          <li>14-day money-back guarantee</li>
          <li>No refunds for API overages</li>
          <li>Disputed charges subject to investigation</li>
        </ul>
      </section>

      <section>
        <h2>7. Privacy and Data Protection</h2>
        <p>Your use is subject to our Privacy Policy, incorporated by reference.</p>
      </section>

      <section>
        <h2>8. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" and "as available" without warranties of any kind, including merchantability, fitness for
          particular purpose, non-infringement, accuracy, or completeness.
        </p>
      </section>

      <section>
        <h2>9. Limitation of Liability</h2>
        <h3>9.1 Exclusion of Damages</h3>
        <p>In no event shall we be liable for:</p>
        <ul>
          <li>Indirect, incidental, special, or consequential damages</li>
          <li>Lost profits or revenue</li>
          <li>Loss of data or use</li>
          <li>Business interruption</li>
          <li>Damages exceeding fees paid in prior 12 months</li>
        </ul>
        <h3>9.2 Essential Purpose</h3>
        <p>These limitations apply even if a remedy fails of its essential purpose.</p>
      </section>

      <section>
        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Blaze Sports Intel, its officers, directors, employees, and affiliates
          from any claims, damages, losses, liabilities, costs, and expenses arising from your violation of these Terms, third-party
          rights, or misuse of the Service.
        </p>
      </section>

      <section>
        <h2>11. Dispute Resolution</h2>
        <h3>11.1 Arbitration Agreement</h3>
        <p>
          You agree to arbitrate all disputes under AAA Commercial Rules in Austin, Texas. Individual claims only (no class actions).
          Each party bears its own costs.
        </p>
        <h3>11.2 Exceptions</h3>
        <ul>
          <li>Small claims court for qualifying claims</li>
          <li>Injunctive relief for IP violations</li>
        </ul>
        <h3>11.3 Opt-Out</h3>
        <p>Mail opt-out within 30 days to: legal@blazesportsintel.com</p>
      </section>

      <section>
        <h2>12. DMCA Compliance</h2>
        <h3>12.1 Copyright Policy</h3>
        <p>
          We respect intellectual property. To report infringement email dmca@blazesportsintel.com with identification, location,
          contact information, and a good-faith statement.
        </p>
        <h3>12.2 Counter-Notification</h3>
        <p>
          If content was wrongly removed, provide identification of removed material, statement of good faith belief, and consent to
          jurisdiction.
        </p>
      </section>

      <section>
        <h2>13. Modifications</h2>
        <h3>13.1 Changes to Terms</h3>
        <p>30-day notice for material changes. Continued use constitutes acceptance. You may terminate if you disagree.</p>
        <h3>13.2 Service Modifications</h3>
        <p>We may modify, suspend, or discontinue features with reasonable notice.</p>
      </section>

      <section>
        <h2>14. Termination</h2>
        <h3>14.1 By You</h3>
        <ul>
          <li>Cancel anytime through account settings</li>
          <li>Request data deletion per Privacy Policy</li>
        </ul>
        <h3>14.2 By Us</h3>
        <ul>
          <li>Violation of Terms</li>
          <li>Extended inactivity (12+ months)</li>
          <li>Legal requirements</li>
          <li>Service discontinuation</li>
        </ul>
        <h3>14.3 Effect of Termination</h3>
        <ul>
          <li>Access immediately revoked</li>
          <li>Data deleted per retention policy</li>
          <li>Surviving provisions remain effective</li>
        </ul>
      </section>

      <section>
        <h2>15. General Provisions</h2>
        <ul>
          <li>Governing Law: Texas law (excluding conflict provisions)</li>
          <li>Severability: Invalid provisions severed; remainder enforceable</li>
          <li>Entire Agreement: These Terms constitute entire agreement</li>
          <li>Assignment: We may assign; you may not without consent</li>
          <li>Force Majeure: No liability for circumstances beyond reasonable control</li>
        </ul>
      </section>

      <section>
        <h2>16. Accessibility</h2>
        <p>We strive for WCAG AA compliance. Report issues to accessibility@blazesportsintel.com.</p>
      </section>

      <section>
        <h2>17. Contact Information</h2>
        <ul>
          <li>Blaze Sports Intel</li>
          <li>Email: legal@blazesportsintel.com</li>
          <li>Support: support@blazesportsintel.com</li>
          <li>Address: Austin, Texas</li>
        </ul>
      </section>
    </main>
  );
}

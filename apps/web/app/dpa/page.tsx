import type { Metadata } from 'next';

const effectiveDate = 'September 28, 2025';

export const metadata: Metadata = {
  title: 'Data Processing Addendum — Blaze Sports Intel',
  description: 'Review Blaze Sports Intel’s GDPR-aligned Data Processing Addendum covering processor obligations, sub-processors, and security measures.'
};

export default function DataProcessingAddendumPage() {
  return (
    <main className="legal-content" id="data-processing-addendum">
      <h1>Data Processing Addendum (DPA)</h1>
      <p>
        <strong>Effective Date:</strong> {effectiveDate}
      </p>

      <section>
        <h2>1. Definitions</h2>
        <ul>
          <li>
            <strong>"Controller":</strong> Blaze Sports Intel (determines purposes and means of processing)
          </li>
          <li>
            <strong>"Processor":</strong> Service providers processing data on our behalf
          </li>
          <li>
            <strong>"Sub-processor":</strong> Third parties engaged by processors
          </li>
          <li>
            <strong>"Personal Data":</strong> Any information relating to identified/identifiable person
          </li>
          <li>
            <strong>"Processing":</strong> Any operation performed on personal data
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Processing Details</h2>
        <h3>2.1 Nature and Purpose</h3>
        <ul>
          <li>Providing sports data and analytics services</li>
          <li>Performance monitoring and optimization</li>
          <li>Security and fraud prevention</li>
          <li>Legal compliance</li>
        </ul>
        <h3>2.2 Categories of Data Subjects</h3>
        <ul>
          <li>Website visitors</li>
          <li>Registered users</li>
          <li>API consumers</li>
          <li>Support contacts</li>
        </ul>
        <h3>2.3 Types of Personal Data</h3>
        <ul>
          <li>Identifiers (IP address, device ID)</li>
          <li>Usage data (pages viewed, features used)</li>
          <li>Account information (email, username)</li>
          <li>Technical data (browser, operating system)</li>
        </ul>
        <h3>2.4 Duration</h3>
        <p>For the term of service agreement plus retention period per Privacy Policy.</p>
      </section>

      <section>
        <h2>3. Processor Obligations</h2>
        <p>Processors shall:</p>
        <ul>
          <li>Process only on documented instructions</li>
          <li>Ensure confidentiality of personnel</li>
          <li>Implement Article 32 security measures</li>
          <li>Engage sub-processors only with consent</li>
          <li>Assist with data subject requests</li>
          <li>Delete or return data upon termination</li>
          <li>Provide audit compliance evidence</li>
          <li>Notify of data breaches immediately</li>
        </ul>
      </section>

      <section>
        <h2>4. Sub-processors</h2>
        <h3>4.1 Authorized Sub-processors</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Location</th>
              <th>Safeguards</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cloudflare</td>
              <td>CDN, Security</td>
              <td>US/EU</td>
              <td>Privacy Shield, SCCs</td>
            </tr>
            <tr>
              <td>AWS</td>
              <td>Infrastructure</td>
              <td>US</td>
              <td>SCCs, SOC 2</td>
            </tr>
            <tr>
              <td>Google Analytics</td>
              <td>Analytics</td>
              <td>US</td>
              <td>SCCs, Anonymization</td>
            </tr>
          </tbody>
        </table>
        <h3>4.2 New Sub-processors</h3>
        <ul>
          <li>30-day advance notice</li>
          <li>Right to object</li>
          <li>Alternative arrangements if objection</li>
        </ul>
      </section>

      <section>
        <h2>5. International Transfers</h2>
        <p>
          Appropriate safeguards via EU Standard Contractual Clauses, UK International Data Transfer Agreement, and supplementary
          measures where required.
        </p>
      </section>

      <section>
        <h2>6. Security Measures</h2>
        <ul>
          <li>Encryption at rest and in transit (TLS 1.3)</li>
          <li>Access controls and authentication</li>
          <li>Regular security assessments</li>
          <li>Incident response procedures</li>
          <li>Business continuity planning</li>
          <li>Employee training</li>
        </ul>
      </section>

      <section>
        <h2>7. Data Subject Rights</h2>
        <p>Processor assists with:</p>
        <ul>
          <li>Access requests (Article 15)</li>
          <li>Rectification (Article 16)</li>
          <li>Erasure (Article 17)</li>
          <li>Restriction (Article 18)</li>
          <li>Portability (Article 20)</li>
          <li>Objection (Article 21)</li>
        </ul>
        <p>Responses provided within 5 business days of request.</p>
      </section>

      <section>
        <h2>8. Breach Notification</h2>
        <ul>
          <li>Immediate notification (within 24 hours)</li>
          <li>Include: nature, categories, numbers affected, consequences, measures taken</li>
          <li>Maintain breach log</li>
          <li>Cooperate with investigation</li>
        </ul>
      </section>

      <section>
        <h2>9. Audit Rights</h2>
        <p>Controller may request compliance certificates, conduct annual audits (30-day notice), inspect processing facilities, and review security measures.</p>
      </section>

      <section>
        <h2>10. Liability and Indemnification</h2>
        <ul>
          <li>Each party liable for own non-compliance</li>
          <li>Processor indemnifies for unauthorized processing</li>
          <li>Liability caps per main agreement</li>
        </ul>
      </section>

      <section>
        <h2>11. Term and Termination</h2>
        <ul>
          <li>Coterminous with main agreement</li>
          <li>Immediate termination for material breach</li>
          <li>Data return or deletion within 30 days</li>
        </ul>
      </section>

      <section>
        <h2>12. Governing Law</h2>
        <p>Same as main agreement (Texas law for US entities, local law for EU processors).</p>
      </section>
    </main>
  );
}

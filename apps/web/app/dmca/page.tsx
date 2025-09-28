import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA Policy — Blaze Sports Intel',
  description: 'Guidelines for submitting Digital Millennium Copyright Act notices and counter-notifications to Blaze Sports Intel.'
};

export default function DmcaPolicyPage() {
  return (
    <main className="legal-content" id="dmca-policy">
      <h1>DMCA Policy</h1>

      <section>
        <h2>1. Copyright Policy</h2>
        <p>
          Blaze Sports Intel respects intellectual property rights. If you believe your copyrighted work has been copied in a way
          that constitutes infringement, please provide a written notice to dmca@blazesportsintel.com including:
        </p>
        <ul>
          <li>Identification of the copyrighted work claimed to have been infringed</li>
          <li>Identification of the material that is claimed to be infringing and information reasonably sufficient to locate it</li>
          <li>Your contact information (name, address, telephone number, email)</li>
          <li>A statement of good faith belief that the disputed use is not authorized</li>
          <li>A statement that the information in the notice is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner</li>
          <li>Your physical or electronic signature</li>
        </ul>
      </section>

      <section>
        <h2>2. Counter-Notification</h2>
        <p>
          If you believe your content was removed or disabled by mistake or misidentification, submit a counter-notification to
          dmca@blazesportsintel.com containing:
        </p>
        <ul>
          <li>Identification of the material that has been removed or to which access has been disabled</li>
          <li>A statement under penalty of perjury that you have a good faith belief the material was removed or disabled as a result of mistake or misidentification</li>
          <li>Your name, address, and telephone number</li>
          <li>A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or Travis County, Texas, if outside the United States)</li>
          <li>Your physical or electronic signature</li>
        </ul>
      </section>

      <section>
        <h2>3. Repeat Infringers</h2>
        <p>We will terminate the accounts of users determined to be repeat infringers.</p>
      </section>

      <section>
        <h2>4. Contact</h2>
        <p>DMCA Agent: dmca@blazesportsintel.com</p>
      </section>
    </main>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Attribution — Blaze Sports Intel',
  description: 'Attribution statements for Blaze Sports Intel’s licensed sports data providers.'
};

export default function AttributionPage() {
  return (
    <main className="legal-content" id="data-attribution">
      <h1>Data Attribution</h1>
      <p>Blaze Sports Intel acknowledges the following official data providers:</p>
      <ul>
        <li>MLB data © MLB Advanced Media, LP. All rights reserved.</li>
        <li>NFL data © NFL Enterprises LLC. All rights reserved.</li>
        <li>NCAA data used under license from respective conferences.</li>
        <li>High school data provided by MaxPreps under applicable agreements.</li>
      </ul>
      <p>
        Required attribution format for public usage:
      </p>
      <pre>
{`Data provided by MLB Advanced Media, LP. © MLBAM {year}.
Retrieved: {timestamp CDT} | Confidence: {score}%`}
      </pre>
    </main>
  );
}

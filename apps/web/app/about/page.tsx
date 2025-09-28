import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Blaze Sports Intel',
  description: 'Learn about Blaze Sports Intel’s mission to deliver elite sports intelligence across Baseball, Football, Basketball, and Track & Field.'
};

export default function AboutPage() {
  return (
    <main className="legal-content" id="about">
      <h1>About Blaze Sports Intel</h1>
      <p>
        Blaze Sports Intel combines advanced analytics, licensed data partnerships, and elite biomechanics research to surface the
        insights that shape competitive advantage. From Baseball to Football, Basketball, and Track & Field, our platform powers
        scouting, player development, and strategic decision-making across the Deep South.
      </p>
      <p>
        We partner with official data providers, protect athlete privacy, and build systems that meet stringent compliance
        requirements from day one. Blaze Sports Intel is headquartered in Austin, Texas.
      </p>
    </main>
  );
}

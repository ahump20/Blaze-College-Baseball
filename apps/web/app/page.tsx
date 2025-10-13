'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

const COOKIE_NAME = 'cookie_consent';
const COOKIE_MAX_AGE_DAYS = 365;

type ConsentState = 'accepted' | 'unknown';

const features = [
  {
    title: 'College Baseball Hub',
    description:
      'Complete Division I coverage with live box scores, pitch-by-pitch data, player pages, and fully produced previews and recaps for every matchup.'
  },
  {
    title: 'Every Team, Every Market',
    description:
      'Localized beat dashboards ensure pro clubs and collegiate programs receive equal attention with alerts tailored to each region.'
  },
  {
    title: 'Emerging Sports Spotlight',
    description:
      'Dedicated desks elevate underserved NCAA sports so Baseball, Football, Basketball, and Track & Field insights stay front and center alongside women’s collegiate table tennis.'
  },
  {
    title: 'Mobile-First Experience',
    description:
      'Optimized for phones with gesture-friendly navigation, offline scorecards, and push alerts tuned to game states.'
  },
  {
    title: 'Real-Time Scores',
    description:
      'Live scoring updates for MLB, NFL, NCAA Division I, and Texas high school sports with college baseball pitch-by-pitch tracking and minimal delay.'
  },
  {
    title: 'Historical Analytics',
    description: 'Comprehensive historical statistics and trend analysis across multiple seasons and leagues.'
  },
  {
    title: 'Power Rankings',
    description: 'Data-driven rankings using validated metrics and peer-reviewed methodologies.'
  },
  {
    title: 'API Integration',
    description: 'RESTful API access with rate limiting, authentication, and comprehensive documentation.'
  }
];

const coverageFocusAreas = [
  {
    title: 'College Baseball Blueprint',
    summary:
      'Division I, II, III, and top JUCO pipelines are treated with the same depth and cadence as professional clubs.',
    highlights: [
      'Full box scores with pitch charts, player stat updates, and live RPI/ISR movement every inning.',
      'Daily preview and recap packages for SEC, ACC, Big 12, Sun Belt, and WCC markets.',
      'Video breakdowns, interviews, and scouting notes ensure LSU, Texas, and every program receive balanced storytelling.'
    ]
  },
  {
    title: 'Market-by-Market Intelligence',
    summary: 'Dedicated editors monitor each region across pro and collegiate landscapes with parity.',
    highlights: [
      'Local dashboards tuned to recruiting pipelines, NIL shifts, and transfer portal movement.',
      'Alert routing so fans in Austin, Baton Rouge, and Starkville never miss lineup changes or injury updates.',
      'Community-sourced insights moderated for accuracy, competitive integrity, and athlete safety.'
    ]
  },
  {
    title: 'Underserved Sports Coverage',
    summary: 'Structured coverage elevates sports national networks overlook without sacrificing analytical rigor.',
    highlights: [
      'Baseball to Football to Basketball to Track & Field storytelling prioritized before expanding daily features.',
      'Women’s collegiate table tennis standings, results, and athlete spotlights refreshed alongside headline sports.',
      'Data ingestion roadmap backed by conference partnerships, compliance reviews, and athlete consent workflows.'
    ]
  }
];

const mobileHighlights = [
  'Native-quality interactions for iOS and Android with thumb-first navigation patterns.',
  'Push notification engine delivering previews, live inning alerts, and final recap capsules without spam.',
  'Offline caching keeps college baseball box scores, standings, and player cards available when reception drops.'
];

const dataSources = [
  'MLB Stats API',
  'NFL Official Stats',
  'NCAA Statistics',
  'MaxPreps (HS Sports)',
  'Sports Reference LLC',
  'Conference Databases'
];

function getCookieValue(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }

  return undefined;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') {
    return;
  }

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict; Secure`;
}

export default function HoldingPage() {
  const [consent, setConsent] = useState<ConsentState>('unknown');
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const isBannerVisible = consent !== 'accepted';

  useEffect(() => {
    const existing = getCookieValue(COOKIE_NAME);
    if (existing === 'accepted') {
      setConsent('accepted');
    }
  }, []);

  const initializeAnalytics = useCallback(() => {
    if (getCookieValue(COOKIE_NAME) === 'accepted') {
      // Placeholder for analytics bootstrap
      console.info('Analytics initialized with consent');
    }
  }, []);

  useEffect(() => {
    if (consent === 'accepted') {
      initializeAnalytics();
    }
  }, [consent, initializeAnalytics]);

  const handleAccept = useCallback(() => {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_MAX_AGE_DAYS);
    setConsent('accepted');
  }, []);

  const handleOpenSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/cookies#settings';
    }
  }, []);

  useEffect(() => {
    if (!isBannerVisible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusable = bannerRef.current?.querySelectorAll<HTMLElement>('button, a');
      if (!focusable || focusable.length === 0) {
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBannerVisible]);

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Blaze Sports Intel',
      url: 'https://blazesportsintel.com',
      description: 'Professional sports data analytics and intelligence platform',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://blazesportsintel.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }),
    []
  );

  return (
    <>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      <div
        id="cookie-banner"
        ref={bannerRef}
        className={isBannerVisible ? 'show' : ''}
        role="region"
        aria-label="Cookie consent"
      >
        <div className="cookie-content">
          <p>
            We use cookies to enhance your experience and analyze site usage. See our{' '}
            <Link href="/privacy">Privacy Policy</Link> for details.
          </p>
          <div className="cookie-buttons">
            <button className="cookie-btn settings" onClick={handleOpenSettings} aria-label="Cookie settings">
              Settings
            </button>
            <button className="cookie-btn accept" onClick={handleAccept} aria-label="Accept all cookies">
              Accept All
            </button>
          </div>
        </div>
      </div>

      <header role="banner">
        <div className="header-container">
          <Link href="/" className="logo" aria-label="Blaze Sports Intel Home">
            Blaze <span>Sports Intel</span>™
          </Link>
          <nav role="navigation" aria-label="Main navigation">
            <ul>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/cookies">Cookie Policy</Link>
              </li>
              <li>
                <Link href="/accessibility">Accessibility</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" role="main">
        <section className="hero">
          <h1>Blaze Sports Intel</h1>
          <p className="tagline">Professional Sports Data Analytics &amp; Intelligence Platform</p>
          <div className="status-badge" role="status" aria-live="polite">
            Platform Launching Soon
          </div>
        </section>

        <div className="legal-notice" role="alert">
          <h3>Important Legal Notice</h3>
          <p>
            This platform is currently in development. By accessing this site, you agree to our Terms of Service and Privacy
            Policy. All sports data will be obtained through official licensed sources. Team names and logos are property of
            their respective owners.
          </p>
        </div>

        <section className="features" aria-labelledby="features-heading">
          <h2 id="features-heading" className="sr-only">
            Platform Features
          </h2>
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="coverage" aria-labelledby="coverage-heading">
          <h2 id="coverage-heading">Coverage Priorities</h2>
          <div className="coverage-grid">
            {coverageFocusAreas.map((area) => (
              <article key={area.title} className="coverage-card">
                <h3>{area.title}</h3>
                <p>{area.summary}</p>
                <ul>
                  {area.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mobile-focus" aria-labelledby="mobile-heading">
          <div className="mobile-focus-content">
            <h2 id="mobile-heading">Mobile-First Delivery</h2>
            <p>
              Blaze Sports Intel prioritizes handheld experiences because fans consume scores, analysis, and clips on the go.
              Every workflow is tuned for phones first, with desktop views following responsive best practices.
            </p>
            <ul>
              {mobileHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="data-sources" aria-labelledby="sources-heading">
          <h2 id="sources-heading">Authorized Data Sources</h2>
          <p>All data obtained through official licensing agreements:</p>
          <div className="source-list">
            {dataSources.map((source) => (
              <div key={source} className="source-item">
                {source}
              </div>
            ))}
          </div>
        </section>

        <section className="compliance" aria-labelledby="compliance-heading">
          <h2 id="compliance-heading" className="sr-only">
            Compliance Information
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-light)', margin: '2rem 0' }}>
            GDPR Compliant • CCPA Compliant • WCAG AA Accessible • SSL Secured
          </p>
        </section>
      </main>

      <footer role="contentinfo">
        <div className="footer-container">
          <div className="footer-grid">
            <section className="footer-section">
              <h3>Legal</h3>
              <ul>
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/cookies">Cookie Policy</Link>
                </li>
                <li>
                  <Link href="/dpa">Data Processing Addendum</Link>
                </li>
                <li>
                  <Link href="/dmca">DMCA Policy</Link>
                </li>
              </ul>
            </section>
            <section className="footer-section">
              <h3>Data Rights</h3>
              <ul>
                <li>
                  <Link href="/gdpr">GDPR Rights (EU)</Link>
                </li>
                <li>
                  <Link href="/ccpa">CCPA Rights (California)</Link>
                </li>
                <li>
                  <Link href="/data-request">Request Your Data</Link>
                </li>
                <li>
                  <Link href="/delete-account">Delete Account</Link>
                </li>
                <li>
                  <Link href="/opt-out">Opt-Out Preferences</Link>
                </li>
              </ul>
            </section>
            <section className="footer-section">
              <h3>Support</h3>
              <ul>
                <li>
                  <a href="mailto:support@blazesportsintel.com">support@blazesportsintel.com</a>
                </li>
                <li>
                  <a href="mailto:privacy@blazesportsintel.com">privacy@blazesportsintel.com</a>
                </li>
                <li>
                  <a href="mailto:legal@blazesportsintel.com">legal@blazesportsintel.com</a>
                </li>
                <li>
                  <a href="mailto:dmca@blazesportsintel.com">dmca@blazesportsintel.com</a>
                </li>
                <li>
                  <Link href="/accessibility">Accessibility Support</Link>
                </li>
              </ul>
            </section>
            <section className="footer-section">
              <h3>Company</h3>
              <ul>
                <li>Blaze Sports Intel</li>
                <li>Austin, Texas</li>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/attribution">Data Attribution</Link>
                </li>
                <li>
                  <Link href="/api-docs">API Documentation</Link>
                </li>
              </ul>
            </section>
          </div>
          <div className="copyright">
            <p>© 2025 Blaze Sports Intel. All rights reserved. Blaze Sports Intel™ is a trademark of Blaze Sports Intel.</p>
            <p>Team names, logos, and insignia are property of their respective owners. No endorsement implied.</p>
            <p>MLB data © MLB Advanced Media, LP. NFL data © NFL Enterprises LLC. NCAA data used under license.</p>
          </div>
        </div>
      </footer>

      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
    </>
  );
}

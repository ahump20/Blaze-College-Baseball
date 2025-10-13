'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { PaywallCallout, ScoreStrip } from '@bsi/ui';
import type { ScoreStripGame } from '@bsi/ui';

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
      'Structured desks elevate underserved NCAA sports so baseball, football, basketball, and track & field insights stay front and center.'
  },
  {
    title: 'Mobile-First Experience',
    description:
      'Optimized for phones with gesture-friendly navigation, offline scorecards, and push alerts tuned to game states.'
  },
  {
    title: 'Real-Time Scores',
    description:
      'Live scoring updates for MLB, NFL, NCAA Division I, and Texas high school sports with college baseball pitch-by-pitch tracking.'
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
      'Division I, II, III, and top JUCO pipelines receive the same depth and cadence as professional clubs.',
    highlights: [
      'Full box scores with pitch charts, player stat updates, and live RPI/ISR movement every inning.',
      'Daily preview and recap packages for SEC, ACC, Big 12, Sun Belt, and WCC markets.',
      'Video breakdowns, interviews, and scouting notes balanced between LSU, Texas, and every program we cover.'
    ]
  },
  {
    title: 'Market-by-Market Intelligence',
    summary: 'Dedicated editors monitor each region across pro and collegiate landscapes with parity.',
    highlights: [
      'Local dashboards tuned to recruiting pipelines, NIL shifts, and transfer portal movement.',
      'Alert routing keeps fans in Austin, Baton Rouge, and Starkville ahead of lineup changes or injuries.',
      'Community-sourced insights moderated for accuracy, competitive integrity, and athlete safety.'
    ]
  },
  {
    title: 'Underserved Sports Coverage',
    summary: 'Structured coverage elevates sports national networks overlook without sacrificing analytical rigor.',
    highlights: [
      'Baseball to football to basketball to track & field storytelling prioritized before expanding daily features.',
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
  'NCAA Statistics',
  'Sports Reference LLC',
  'Conference Databases',
  'MaxPreps (HS Sports)',
  'Official Team & League Feeds'
];

const highlightGames: ScoreStripGame[] = [
  {
    id: 'lsu-arkansas',
    awayTeam: 'LSU',
    awayRank: 2,
    awayScore: 6,
    homeTeam: 'Arkansas',
    homeRank: 5,
    homeScore: 4,
    status: 'Final'
  },
  {
    id: 'texas-aggies',
    awayTeam: 'Texas',
    awayRank: 11,
    awayScore: 3,
    homeTeam: 'Texas A&M',
    homeRank: 8,
    homeScore: 3,
    status: 'T7 • ESPNU'
  },
  {
    id: 'wake-clemson',
    awayTeam: 'Wake Forest',
    awayRank: 4,
    awayScore: undefined,
    homeTeam: 'Clemson',
    homeRank: 16,
    homeScore: undefined,
    status: 'Upcoming',
    startTime: '1:00 PM CT'
  }
];

const diamondBenefits = [
  'Pitch-by-pitch win probability, velocity, and biomechanical risk models updated every inning.',
  'Automated video and spray chart breakdowns for hitters, pitchers, and defensive alignments.',
  'Recruiting, transfer portal, and MLB Draft scouting dashboards with verified sourcing.'
];

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-space-md focus:top-space-md focus:z-[9999] focus:rounded-md focus:bg-accent-gold focus:px-sm focus:py-xs focus:text-background"
      >
        Skip to main content
      </a>

      <div
        id="cookie-banner"
        ref={bannerRef}
        className={cx(
          'fixed inset-x-0 bottom-0 z-50 border-t border-border-strong bg-background-surface text-foreground shadow-surface transition-all duration-300',
          isBannerVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
        )}
        role="region"
        aria-label="Cookie consent"
        aria-hidden={!isBannerVisible}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-sm px-lg py-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground-muted">
            We use cookies to enhance your experience and analyze site usage. See our{' '}
            <Link href="/privacy" className="underline decoration-dotted underline-offset-4">
              Privacy Policy
            </Link>{' '}
            for details.
          </p>
          <div className="flex items-center gap-xs">
            <button
              className="rounded-md border border-border-strong px-md py-xs text-sm font-semibold text-foreground transition hover:text-accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={handleOpenSettings}
              aria-label="Cookie settings"
            >
              Settings
            </button>
            <button
              className="rounded-md bg-accent-gold px-md py-xs text-sm font-semibold text-background transition hover:bg-accent-crimson focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={handleAccept}
              aria-label="Accept all cookies"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      <header className="border-b border-border-strong bg-background-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-md px-lg py-md">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground transition hover:text-accent-gold"
            aria-label="Blaze Sports Intel Home"
          >
            Blaze <span className="text-accent-gold">Sports Intel</span>™
          </Link>
          <nav role="navigation" aria-label="Main navigation">
            <ul className="flex flex-wrap items-center gap-sm text-sm text-foreground-muted">
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

      <main
        id="main-content"
        role="main"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-2xl px-lg py-2xl"
      >
        <section className="flex flex-col items-center gap-md text-center">
          <div className="inline-flex items-center gap-2xs rounded-pill border border-border-strong bg-background-elevated px-md py-2xs text-xs font-semibold uppercase tracking-[0.3em] text-foreground-muted">
            College Baseball Intelligence
          </div>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Blaze Sports Intel
          </h1>
          <p className="max-w-2xl text-base text-foreground-muted sm:text-lg">
            Professional sports data analytics and intelligence platform focused on powering the Deep South’s college baseball programs with live insights and evergreen coverage.
          </p>
          <div
            className="rounded-pill border border-accent-gold/40 bg-background-elevated px-md py-2xs text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold"
            role="status"
            aria-live="polite"
          >
            Platform Launching Soon
          </div>
        </section>

        <ScoreStrip games={highlightGames} className="w-full" />

        <section className="rounded-lg border border-border-strong bg-background-elevated px-lg py-lg text-sm text-foreground-muted shadow-surface">
          <h3 className="text-base font-semibold text-foreground">Important Legal Notice</h3>
          <p className="mt-xs">
            This platform is currently in development. By accessing this site, you agree to our Terms of Service and Privacy Policy. All sports data will be obtained through official licensed sources. Team names and logos are property of their respective owners.
          </p>
        </section>

        <section className="space-y-lg">
          <div className="space-y-2xs">
            <h2 id="features-heading" className="text-lg font-semibold text-foreground">
              Why programs choose Blaze Sports Intel
            </h2>
            <p className="text-sm text-foreground-muted">
              Diamond-ready infrastructure blending licensed data, automated storytelling, and compliance workflows.
            </p>
          </div>
          <div className="grid gap-md sm:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col gap-xs rounded-lg border border-border-strong/60 bg-background-surface px-lg py-md shadow-surface"
              >
                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground-muted">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-lg" aria-labelledby="coverage-heading">
          <div className="space-y-2xs">
            <h2 id="coverage-heading" className="text-lg font-semibold text-foreground">
              Coverage Priorities
            </h2>
            <p className="text-sm text-foreground-muted">
              Built for beat writers, analysts, and recruiting coordinators who live college baseball year-round.
            </p>
          </div>
          <div className="grid gap-md lg:grid-cols-3">
            {coverageFocusAreas.map((area) => (
              <article
                key={area.title}
                className="flex h-full flex-col gap-sm rounded-lg border border-border-strong/60 bg-background-surface px-lg py-md shadow-surface"
              >
                <div className="space-y-2xs">
                  <h3 className="text-base font-semibold text-foreground">{area.title}</h3>
                  <p className="text-sm text-foreground-muted">{area.summary}</p>
                </div>
                <ul className="space-y-2xs text-sm text-foreground-muted">
                  {area.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2xs">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-gold" aria-hidden />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-lg rounded-2xl border border-border-strong bg-background-surface px-lg py-lg lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-sm">
            <h2 id="mobile-heading" className="text-lg font-semibold text-foreground">
              Mobile-First Delivery
            </h2>
            <p className="text-sm text-foreground-muted">
              Blaze Sports Intel prioritizes handheld experiences because fans consume scores, analysis, and clips on the go. Every workflow is tuned for phones first, with desktop views following responsive best practices.
            </p>
            <ul className="space-y-2xs text-sm text-foreground-muted">
              {mobileHighlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2xs">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-gold" aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border-strong/60 bg-background-elevated px-lg py-md shadow-surface">
            <PaywallCallout
              title="Unlock Diamond Pro"
              description="Premium access for coaching staffs, scouting departments, and regional media partners."
              benefits={diamondBenefits}
              ctaLabel="Talk with our team"
              ctaHref="mailto:sales@blazesportsintel.com"
            />
          </div>
        </section>

        <section className="space-y-md" aria-labelledby="sources-heading">
          <div className="space-y-2xs">
            <h2 id="sources-heading" className="text-lg font-semibold text-foreground">
              Authorized Data Sources
            </h2>
            <p className="text-sm text-foreground-muted">All data obtained through official licensing agreements.</p>
          </div>
          <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
            {dataSources.map((source) => (
              <div
                key={source}
                className="rounded-lg border border-border-strong/60 bg-background-surface px-lg py-sm text-sm text-foreground shadow-surface"
              >
                {source}
              </div>
            ))}
          </div>
        </section>

        <section className="text-center text-xs font-medium uppercase tracking-[0.3em] text-foreground-muted">
          GDPR Compliant • CCPA Compliant • WCAG AA Accessible • SSL Secured
        </section>
      </main>

      <footer className="border-t border-border-strong bg-background-surface/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-xl px-lg py-xl">
          <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-4">
            <section className="space-y-2xs">
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="space-y-2xs text-sm text-foreground-muted">
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
            <section className="space-y-2xs">
              <h3 className="text-sm font-semibold text-foreground">Data Rights</h3>
              <ul className="space-y-2xs text-sm text-foreground-muted">
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
            <section className="space-y-2xs">
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <ul className="space-y-2xs text-sm text-foreground-muted">
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
            <section className="space-y-2xs">
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-2xs text-sm text-foreground-muted">
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
          <div className="space-y-2xs text-xs text-foreground-muted">
            <p>© 2025 Blaze Sports Intel. All rights reserved. Blaze Sports Intel™ is a trademark of Blaze Sports Intel.</p>
            <p>Team names, logos, and insignia are property of their respective owners. No endorsement implied.</p>
            <p>MLB data © MLB Advanced Media, LP. NCAA data used under license. Additional collegiate data powered by conference partnerships.</p>
          </div>
        </div>
      </footer>

      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
    </>
  );
}

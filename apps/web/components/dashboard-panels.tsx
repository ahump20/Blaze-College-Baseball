'use client';

import Link from 'next/link';
import type { FavoriteTeam, AlertPreferences } from './subscription-context';
import { ProFeature } from './pro-feature';
import { useIsPro } from './subscription-context';

type DashboardPanelsProps = {
  favorites: FavoriteTeam[];
  alerts: AlertPreferences;
  proAnalytics?: Array<{ title: string; metric: string; delta?: string }>;
};

export function DashboardPanels({ favorites, alerts, proAnalytics = [] }: DashboardPanelsProps) {
  const isPro = useIsPro();

  return (
    <div className="di-card-grid">
      <article className="di-card">
        <h2>Favorite Programs</h2>
        {favorites.length === 0 ? (
          <p className="di-text-muted">Add programs to track them across live games, portal moves, and RPI swings.</p>
        ) : (
          <ul className="di-list">
            {favorites.map((team) => (
              <li key={team.id}>
                <span className="di-strong">{team.teamName ?? team.teamSlug}</span>
                {team.conference ? <span className="di-text-muted"> · {team.conference}</span> : null}
              </li>
            ))}
          </ul>
        )}
        <Link className="di-inline-link" href="/baseball/ncaab/teams">
          Manage favorites
        </Link>
      </article>

      <article className="di-card">
        <h2>Alert Preferences</h2>
        <ul className="di-list">
          <li>Game start: {alerts.gameStart ? 'On' : 'Off'}</li>
          <li>Final score: {alerts.finalScore ? 'On' : 'Off'}</li>
          <li>Recruiting: {alerts.recruiting ? 'On' : 'Off'}</li>
          <li>Breaking news: {alerts.breakingNews ? 'On' : 'Off'}</li>
          <li>Nightly digest: {alerts.nightlyDigest ? 'On' : 'Off'}</li>
        </ul>
        <Link className="di-inline-link" href="/account/settings">
          Adjust notifications
        </Link>
      </article>

      <ProFeature title="Pro Velocity Leaderboard" description="Track average fastball velocity and spin rate for your roster in real time.">
        {proAnalytics.length > 0 ? (
          <ul className="di-list">
            {proAnalytics.map((item) => (
              <li key={item.title}>
                <span className="di-strong">{item.title}</span> — {item.metric}
                {item.delta ? <span className="di-text-muted"> ({item.delta})</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="di-text-muted">Data initializes once your connected teams take the field.</p>
        )}
      </ProFeature>

      <ProFeature title="Push Notifications" description="Set custom thresholds for portal alerts, radar data, and staff updates.">
        <p className="di-text-muted">
          Build rule-based triggers for roster changes, advanced scouting flags, and portal prospects hitting your watch bands.
        </p>
        <Link className="di-inline-link" href="/account/alerts">
          Configure alert automations
        </Link>
      </ProFeature>

      <article className="di-card">
        <h2>Diamond Pro Status</h2>
        <p className="di-text-muted">
          {isPro
            ? 'You have full access to Diamond Pro analytics and push automation.'
            : 'Upgrade to Diamond Pro to unlock velocity tracking, player comps, and recruiting heat maps.'}
        </p>
        <Link className="di-action" href={isPro ? '/account/billing' : '/diamond-pro'}>
          {isPro ? 'Manage billing' : 'Upgrade to Diamond Pro'}
        </Link>
      </article>
    </div>
  );
}

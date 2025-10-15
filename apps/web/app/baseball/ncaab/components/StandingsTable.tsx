'use client';

import styles from './StandingsTable.module.css';
import type { StandingsRow } from '../lib/mock-data';

export interface StandingsTableProps {
  teams: StandingsRow[];
  conference: string;
  isMobile: boolean;
}

export function StandingsTable({ teams, conference, isMobile }: StandingsTableProps) {
  return (
    <div className={styles.wrapper} data-view={isMobile ? 'mobile' : 'desktop'}>
      <table className={styles.table} aria-label={`${conference} standings table`}>
        <thead>
          <tr>
            <th scope="col">Team</th>
            <th scope="col">Conf</th>
            <th scope="col" className={styles.desktopOnly}>
              Overall
            </th>
            <th scope="col" className={styles.desktopOnly}>
              Run Diff
            </th>
            <th scope="col">Streak</th>
            <th scope="col" className={styles.desktopOnly}>
              Last 10
            </th>
            <th scope="col" className={styles.desktopOnly}>
              Home
            </th>
            <th scope="col" className={styles.desktopOnly}>
              Road
            </th>
            <th scope="col" className={styles.desktopOnly}>
              RPI
            </th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team.id}>
              <th scope="row">
                <div className={styles.teamCell}>
                  <span className={styles.rank}>{index + 1}</span>
                  <div>
                    <span className={styles.teamName}>{team.name}</span>
                    <span className={styles.teamShort}>{team.shortName}</span>
                  </div>
                </div>
              </th>
              <td>
                {team.conferenceRecord.wins}-{team.conferenceRecord.losses}
              </td>
              <td className={styles.desktopOnly}>
                {team.overallRecord.wins}-{team.overallRecord.losses}
              </td>
              <td className={styles.desktopOnly}>{team.runDifferential >= 0 ? `+${team.runDifferential}` : team.runDifferential}</td>
              <td>{team.streak}</td>
              <td className={styles.desktopOnly}>
                {team.lastTen.wins}-{team.lastTen.losses}
              </td>
              <td className={styles.desktopOnly}>
                {team.homeRecord.wins}-{team.homeRecord.losses}
              </td>
              <td className={styles.desktopOnly}>
                {team.roadRecord.wins}-{team.roadRecord.losses}
              </td>
              <td className={styles.desktopOnly}>{team.rpi.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

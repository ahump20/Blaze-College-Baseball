'use client';

import useSWR from 'swr';
import type { GamesResponse, StandingsResponse } from '../types';

const jsonFetcher = async <T>(input: string): Promise<T> => {
  const response = await fetch(input, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (typeof payload?.message === 'string') {
        message = payload.message;
      }
    } catch (error) {
      // Ignore JSON parse errors – fall back to default message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

const gamesFetcher = (input: string) => jsonFetcher<GamesResponse>(input);
const standingsFetcher = (input: string) => jsonFetcher<StandingsResponse>(input);

export function useLiveGames() {
  return useSWR<GamesResponse, Error>('/api/v1/games', gamesFetcher, {
    refreshInterval: 45000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    keepPreviousData: true,
    suspense: false,
  });
}

export function useConferenceStandings(conference: string) {
  const key = conference ? `/api/v1/standings/${conference}` : null;
  return useSWR<StandingsResponse, Error>(key, standingsFetcher, {
    refreshInterval: 120000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    keepPreviousData: true,
    suspense: false,
  });
}

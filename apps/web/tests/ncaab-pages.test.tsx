import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GamesPage from '../app/baseball/ncaab/games/page';
import StandingsPage from '../app/baseball/ncaab/standings/page';

interface MockResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

type FetchHandler = (input: RequestInfo | URL, init?: RequestInit) => Promise<MockResponse>;

const renderWithSWR = (ui: React.ReactElement) => {
  return render(
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        errorRetryInterval: 0,
        shouldRetryOnError: false,
      }}
    >
      {ui}
    </SWRConfig>
  );
};

const createResponse = (payload: unknown, ok = true, status = 200): MockResponse => ({
  ok,
  status,
  json: () => Promise.resolve(payload),
});

const createMatchMedia = (matches: boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

window.matchMedia = createMatchMedia(false) as unknown as typeof window.matchMedia;

describe('NCAA baseball live surfaces', () => {
  afterEach(() => {
    vi.clearAllMocks();
    window.matchMedia = createMatchMedia(false) as unknown as typeof window.matchMedia;
    window.innerWidth = 1024;
  });

  it('renders live games data and exposes box score navigation', async () => {
    let resolveGames: ((value: MockResponse) => void) | undefined;
    const fetchMock = vi.fn<Parameters<FetchHandler>[0], ReturnType<FetchHandler>>((input) => {
      if (typeof input === 'string' && input.includes('/api/v1/games')) {
        return new Promise<MockResponse>((resolve) => {
          resolveGames = resolve;
        });
      }

      return Promise.resolve(createResponse({ message: 'Unhandled request' }));
    }) as FetchHandler;

    global.fetch = fetchMock as unknown as typeof fetch;

    renderWithSWR(<GamesPage />);

    expect(screen.getByText(/Loading live games/i)).toBeInTheDocument();

    resolveGames?.(
      createResponse({
        lastUpdated: '2025-03-14T18:25:00.000Z',
        games: [
          {
            id: 'lsu-florida-2025-03-14',
            startTime: '2025-03-14T18:00:00.000Z',
            status: 'live',
            inning: 5,
            inningHalf: 'Bottom',
            leverageIndex: 3.5,
            away: { id: 'uf', name: 'Florida Gators', score: 4, record: '17-6' },
            home: { id: 'lsu', name: 'LSU Tigers', score: 5, record: '19-4' },
          },
        ],
      })
    );

    await waitFor(() => {
      expect(screen.getAllByText('LSU Tigers').length).toBeGreaterThan(0);
    });

    expect(
      screen.getByRole('link', {
        name: /View box score for Florida Gators vs LSU Tigers/i,
      })
    ).toBeInTheDocument();
  });

  it('shows mobile empty state when no games are scheduled', async () => {
    const fetchMock = vi.fn<Parameters<FetchHandler>[0], ReturnType<FetchHandler>>((input) => {
      if (typeof input === 'string' && input.includes('/api/v1/games')) {
        return Promise.resolve(
          createResponse({
            lastUpdated: '2025-03-14T18:25:00.000Z',
            games: [],
          })
        );
      }

      return Promise.resolve(createResponse({ message: 'Unhandled request' }));
    }) as FetchHandler;

    global.fetch = fetchMock as unknown as typeof fetch;
    window.matchMedia = createMatchMedia(true) as unknown as typeof window.matchMedia;

    renderWithSWR(<GamesPage />);

    const emptyHeading = await screen.findByText(/No games on the slate/i);
    const container = emptyHeading.closest('article');
    expect(container).not.toBeNull();
    expect(container).toHaveAttribute('data-breakpoint', 'mobile');
  });

  it('updates standings when the conference selector changes', async () => {
    const fetchMock = vi
      .fn<Parameters<FetchHandler>[0], ReturnType<FetchHandler>>((input) => {
        if (typeof input === 'string' && input.includes('/api/v1/standings/sec')) {
          return Promise.resolve(
            createResponse({
              conference: 'sec',
              displayName: 'SEC',
              lastUpdated: '2025-03-14T18:25:00.000Z',
              rows: [
                {
                  teamId: 'lsu',
                  team: 'LSU Tigers',
                  conference: { wins: 5, losses: 1, pct: 0.833 },
                  overall: { wins: 19, losses: 4, pct: 0.826 },
                },
              ],
            })
          );
        }

        if (typeof input === 'string' && input.includes('/api/v1/standings/acc')) {
          return Promise.resolve(
            createResponse({
              conference: 'acc',
              displayName: 'ACC',
              lastUpdated: '2025-03-14T18:25:00.000Z',
              rows: [
                {
                  teamId: 'wake',
                  team: 'Wake Forest Demon Deacons',
                  conference: { wins: 6, losses: 0, pct: 1 },
                  overall: { wins: 20, losses: 2, pct: 0.909 },
                },
              ],
            })
          );
        }

        return Promise.resolve(createResponse({ message: 'Unhandled request' }));
      }) as FetchHandler;

    global.fetch = fetchMock as unknown as typeof fetch;

    renderWithSWR(<StandingsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('LSU Tigers').length).toBeGreaterThan(0);
    });

    const select = screen.getByLabelText(/Select college baseball conference/i);
    await userEvent.selectOptions(select, 'acc');

    await waitFor(() => {
      expect(screen.getAllByText('Wake Forest Demon Deacons').length).toBeGreaterThan(0);
    });
  });

  it('surfaces error state on mobile breakpoints for standings', async () => {
    const fetchMock = vi.fn<Parameters<FetchHandler>[0], ReturnType<FetchHandler>>((input) => {
      if (typeof input === 'string' && input.includes('/api/v1/standings/sec')) {
        return Promise.resolve(createResponse({ message: 'Service offline' }, false, 503));
      }

      return Promise.resolve(createResponse({ message: 'Unhandled request' }));
    }) as FetchHandler;

    global.fetch = fetchMock as unknown as typeof fetch;
    window.innerWidth = 420;
    window.matchMedia = createMatchMedia(true) as unknown as typeof window.matchMedia;

    renderWithSWR(<StandingsPage />);

    const alertHeading = await screen.findByText(/Standings request failed/i);
    const container = alertHeading.closest('article');
    expect(container).not.toBeNull();
    expect(container).toHaveAttribute('data-breakpoint', 'mobile');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/standings/sec'), expect.anything());
  });
});
